const { ethers } = require('ethers');
const { logger } = require('../utils/logger');
const { runQuery, getQuery } = require('./database');

let provider;
let wallet;
let contract;

// Smart contract ABI for consent management
const CONSENT_CONTRACT_ABI = [
  "event ConsentGranted(address indexed patient, address indexed provider, uint256 indexed consentId, string dataType, uint256 timestamp)",
  "event ConsentRevoked(address indexed patient, address indexed provider, uint256 indexed consentId, uint256 timestamp)",
  "event DataAccess(address indexed provider, address indexed patient, uint256 indexed consentId, string dataType, uint256 timestamp)",
  "function grantConsent(address provider, string dataType, uint256 expiry) external returns (uint256)",
  "function revokeConsent(uint256 consentId) external",
  "function checkConsent(address patient, address provider, string dataType) external view returns (bool, uint256)",
  "function getConsentDetails(uint256 consentId) external view returns (address, address, string, uint256, uint256, bool)",
  "function recordDataAccess(address patient, string dataType, uint256 consentId) external"
];

// Initialize blockchain connection
const initializeBlockchain = async () => {
  try {
    const rpcUrl = process.env.ETHEREUM_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!rpcUrl || !privateKey || !contractAddress) {
      logger.warning('Blockchain configuration incomplete. Blockchain features will be disabled.');
      return;
    }

    // Initialize provider
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Initialize wallet
    wallet = new ethers.Wallet(privateKey, provider);
    
    // Initialize contract
    contract = new ethers.Contract(contractAddress, CONSENT_CONTRACT_ABI, wallet);
    
    // Test connection
    await testBlockchainConnection();
    
    logger.success('Blockchain service initialized successfully');
    
  } catch (error) {
    logger.errorWithContext(error, 'blockchain_initialization');
    throw error;
  }
};

// Test blockchain connection
const testBlockchainConnection = async () => {
  try {
    const network = await provider.getNetwork();
    const balance = await wallet.getBalance();
    
    logger.blockchain('Blockchain connection test successful', {
      network: network.name,
      chainId: network.chainId,
      walletAddress: wallet.address,
      balance: ethers.formatEther(balance)
    });
    
  } catch (error) {
    logger.errorWithContext(error, 'blockchain_connection_test');
    throw new Error('Failed to connect to blockchain network');
  }
};

// Grant patient consent
const grantConsent = async (patientAddress, providerAddress, dataType, expiryDays = 365) => {
  try {
    const startTime = Date.now();
    
    // Calculate expiry timestamp
    const expiry = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);
    
    // Call smart contract
    const tx = await contract.grantConsent(providerAddress, dataType, expiry);
    const receipt = await tx.wait();
    
    // Extract consent ID from event
    const consentEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'ConsentGranted';
      } catch {
        return false;
      }
    });
    
    const consentId = consentEvent ? contract.interface.parseLog(consentEvent).args[2] : null;
    
    // Record in local database
    await recordConsentInDatabase(consentId, patientAddress, providerAddress, dataType, expiry, 'granted');
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Consent granted successfully', {
      consentId: consentId?.toString(),
      patientAddress,
      providerAddress,
      dataType,
      expiry,
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    });
    
    return {
      consentId: consentId?.toString(),
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'consent_grant', {
      patientAddress,
      providerAddress,
      dataType
    });
    throw error;
  }
};

// Revoke patient consent
const revokeConsent = async (consentId) => {
  try {
    const startTime = Date.now();
    
    // Call smart contract
    const tx = await contract.revokeConsent(consentId);
    const receipt = await tx.wait();
    
    // Update local database
    await updateConsentStatus(consentId, 'revoked');
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Consent revoked successfully', {
      consentId: consentId.toString(),
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    });
    
    return {
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'consent_revoke', {
      consentId: consentId.toString()
    });
    throw error;
  }
};

// Check if consent exists and is valid
const checkConsent = async (patientAddress, providerAddress, dataType) => {
  try {
    // Check on blockchain
    const [hasConsent, consentId] = await contract.checkConsent(patientAddress, providerAddress, dataType);
    
    // Check expiry
    let isValid = hasConsent;
    if (hasConsent) {
      const consentDetails = await contract.getConsentDetails(consentId);
      const expiry = consentDetails[4];
      const isActive = consentDetails[5];
      isValid = isActive && expiry > Math.floor(Date.now() / 1000);
    }
    
    logger.blockchain('Consent check completed', {
      patientAddress,
      providerAddress,
      dataType,
      hasConsent,
      consentId: consentId.toString(),
      isValid
    });
    
    return {
      hasConsent,
      consentId: consentId.toString(),
      isValid
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'consent_check', {
      patientAddress,
      providerAddress,
      dataType
    });
    throw error;
  }
};

// Record data access for audit trail
const recordDataAccess = async (patientAddress, dataType, consentId) => {
  try {
    const startTime = Date.now();
    
    // Call smart contract
    const tx = await contract.recordDataAccess(patientAddress, dataType, consentId);
    const receipt = await tx.wait();
    
    // Record in local database
    await recordDataAccessInDatabase(patientAddress, dataType, consentId, tx.hash);
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Data access recorded', {
      patientAddress,
      dataType,
      consentId: consentId.toString(),
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    });
    
    return {
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      duration
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'data_access_record', {
      patientAddress,
      dataType,
      consentId: consentId.toString()
    });
    throw error;
  }
};

// Create consent token for patient
const createConsentToken = async (patientId, dataTypes, expiryDays = 365) => {
  try {
    const startTime = Date.now();
    
    // Get patient's blockchain address
    const patient = await getQuery('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Generate patient's blockchain address if not exists
    let patientAddress = patient.consent_token;
    if (!patientAddress) {
      patientAddress = ethers.Wallet.createRandom().address;
      await runQuery(
        'UPDATE patients SET consent_token = ? WHERE id = ?',
        [patientAddress, patientId]
      );
    }
    
    const consents = [];
    
    // Grant consent for each data type
    for (const dataType of dataTypes) {
      const consent = await grantConsent(patientAddress, wallet.address, dataType, expiryDays);
      consents.push({
        dataType,
        consentId: consent.consentId,
        transactionHash: consent.transactionHash
      });
    }
    
    const duration = Date.now() - startTime;
    
    logger.blockchain('Consent tokens created', {
      patientId,
      patientAddress,
      dataTypes,
      consents,
      duration
    });
    
    return {
      patientAddress,
      consents,
      duration
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'consent_token_creation', {
      patientId,
      dataTypes
    });
    throw error;
  }
};

// Verify consent before data access
const verifyConsentForDataAccess = async (patientId, dataType, userId) => {
  try {
    // Get patient's blockchain address
    const patient = await getQuery('SELECT consent_token FROM patients WHERE id = ?', [patientId]);
    if (!patient || !patient.consent_token) {
      throw new Error('Patient consent token not found');
    }
    
    // Get user's blockchain address
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check consent on blockchain
    const consentCheck = await checkConsent(patient.consent_token, wallet.address, dataType);
    
    if (!consentCheck.hasConsent || !consentCheck.isValid) {
      throw new Error('Valid consent not found for data access');
    }
    
    // Record data access
    await recordDataAccess(patient.consent_token, dataType, consentCheck.consentId);
    
    logger.blockchain('Consent verified for data access', {
      patientId,
      dataType,
      userId,
      consentId: consentCheck.consentId
    });
    
    return {
      hasConsent: true,
      consentId: consentCheck.consentId
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'consent_verification', {
      patientId,
      dataType,
      userId
    });
    throw error;
  }
};

// Get audit trail for patient
const getAuditTrail = async (patientId, limit = 50) => {
  try {
    // Get from local database
    const auditRecords = await getQuery(`
      SELECT * FROM blockchain_audit 
      WHERE resource_type = 'patient' AND resource_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [patientId, limit]);
    
    return auditRecords;
    
  } catch (error) {
    logger.errorWithContext(error, 'audit_trail_retrieval', {
      patientId
    });
    throw error;
  }
};

// Database helper functions
const recordConsentInDatabase = async (consentId, patientAddress, providerAddress, dataType, expiry, status) => {
  try {
    await runQuery(`
      INSERT INTO blockchain_audit (
        id, transaction_hash, action, user_id, resource_type, resource_id, 
        consent_token, metadata, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `consent-${Date.now()}`,
      null, // Will be updated when transaction is confirmed
      'consent_granted',
      providerAddress,
      'consent',
      consentId?.toString(),
      patientAddress,
      JSON.stringify({ dataType, expiry }),
      status,
      new Date().toISOString()
    ]);
  } catch (error) {
    logger.errorWithContext(error, 'consent_database_record');
    throw error;
  }
};

const updateConsentStatus = async (consentId, status) => {
  try {
    await runQuery(`
      UPDATE blockchain_audit 
      SET status = ?, updated_at = ? 
      WHERE resource_id = ? AND action = 'consent_granted'
    `, [status, new Date().toISOString(), consentId.toString()]);
  } catch (error) {
    logger.errorWithContext(error, 'consent_status_update');
    throw error;
  }
};

const recordDataAccessInDatabase = async (patientAddress, dataType, consentId, transactionHash) => {
  try {
    await runQuery(`
      INSERT INTO blockchain_audit (
        id, transaction_hash, action, user_id, resource_type, resource_id, 
        consent_token, metadata, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `access-${Date.now()}`,
      transactionHash,
      'data_access',
      wallet.address,
      'patient_data',
      consentId.toString(),
      patientAddress,
      JSON.stringify({ dataType }),
      'confirmed',
      new Date().toISOString()
    ]);
  } catch (error) {
    logger.errorWithContext(error, 'data_access_database_record');
    throw error;
  }
};

// Get blockchain provider instance
const getProvider = () => {
  return provider;
};

// Get wallet instance
const getWallet = () => {
  return wallet;
};

// Get contract instance
const getContract = () => {
  return contract;
};

// Check if blockchain is available
const isBlockchainAvailable = () => {
  return !!(provider && wallet && contract);
};

module.exports = {
  initializeBlockchain,
  grantConsent,
  revokeConsent,
  checkConsent,
  recordDataAccess,
  createConsentToken,
  verifyConsentForDataAccess,
  getAuditTrail,
  getProvider,
  getWallet,
  getContract,
  isBlockchainAvailable
}; 