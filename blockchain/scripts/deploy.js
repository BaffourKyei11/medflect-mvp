// Deploy ConsentToken and AccessLog to Hyperledger Besu (permissioned Ethereum)
const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const CONSENT_TOKEN_PATH = '../contracts/ConsentToken.sol';
const ACCESS_LOG_PATH = '../contracts/AccessLog.sol';

async function main() {
  // RPC URL and private key for Besu node
  const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL || 'http://localhost:8545');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Compile contracts (assumes solc is installed and in PATH)
  const solc = require('solc');
  const input = {
    language: 'Solidity',
    sources: {
      'ConsentToken.sol': {
        content: fs.readFileSync(__dirname + '/../contracts/ConsentToken.sol', 'utf8'),
      },
      'AccessLog.sol': {
        content: fs.readFileSync(__dirname + '/../contracts/AccessLog.sol', 'utf8'),
      },
    },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (!output.contracts) throw new Error('Solidity compilation failed');

  // Deploy ConsentToken
  const ConsentTokenArtifact = output.contracts['ConsentToken.sol']['ConsentToken'];
  const ConsentTokenFactory = new ethers.ContractFactory(ConsentTokenArtifact.abi, ConsentTokenArtifact.evm.bytecode.object, wallet);
  const consentToken = await ConsentTokenFactory.deploy();
  await consentToken.waitForDeployment();
  console.log('ConsentToken deployed at:', consentToken.target);

  // Deploy AccessLog
  const AccessLogArtifact = output.contracts['AccessLog.sol']['AccessLog'];
  const AccessLogFactory = new ethers.ContractFactory(AccessLogArtifact.abi, AccessLogArtifact.evm.bytecode.object, wallet);
  const accessLog = await AccessLogFactory.deploy();
  await accessLog.waitForDeployment();
  console.log('AccessLog deployed at:', accessLog.target);

  // Save addresses and ABIs
  fs.writeFileSync(__dirname + '/../build/ConsentToken.json', JSON.stringify({ address: consentToken.target, abi: ConsentTokenArtifact.abi }, null, 2));
  fs.writeFileSync(__dirname + '/../build/AccessLog.json', JSON.stringify({ address: accessLog.target, abi: AccessLogArtifact.abi }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
