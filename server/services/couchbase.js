const { logger } = require('../utils/logger');
const couchbase = require('couchbase');

let cluster;
let bucket;
let collection;

// Initialize Couchbase connection
const initializeCouchbase = async () => {
  try {
    const couchbaseHost = process.env.COUCHBASE_HOST || 'localhost';
    const couchbaseUsername = process.env.COUCHBASE_USERNAME || 'Administrator';
    const couchbasePassword = process.env.COUCHBASE_PASSWORD || 'password';
    const couchbaseBucket = process.env.COUCHBASE_BUCKET || 'medflect';

    // Connect to Couchbase cluster
    cluster = await couchbase.Cluster.connect(`couchbase://${couchbaseHost}`, {
      username: couchbaseUsername,
      password: couchbasePassword
    });

    // Get bucket and default collection
    bucket = cluster.bucket(couchbaseBucket);
    collection = bucket.defaultCollection();

    // Test connection
    await testCouchbaseConnection();

    logger.success('Couchbase service initialized successfully');

  } catch (error) {
    logger.errorWithContext(error, 'couchbase_initialization');
    throw error;
  }
};

// Test Couchbase connection
const testCouchbaseConnection = async () => {
  try {
    const pingResult = await bucket.ping();
    logger.info('Couchbase connection test successful', {
      bucket: bucket.name,
      pingResult
    });
  } catch (error) {
    logger.warning('Couchbase connection test failed', {
      error: error.message
    });
    throw error;
  }
};

// Get cluster instance
const getCluster = () => {
  return cluster;
};

// Get bucket instance
const getBucket = () => {
  return bucket;
};

// Get collection instance
const getCollection = () => {
  return collection;
};

// Check if Couchbase is available
const isCouchbaseAvailable = () => {
  return !!(cluster && bucket && collection);
};

// CRUD operations for patients
const savePatient = async (patient) => {
  try {
    const key = patient.id || `patient_${Date.now()}`;
    const result = await collection.upsert(key, {
      ...patient,
      type: 'patient',
      created_at: patient.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    logger.info('Patient saved to Couchbase', {
      key,
      cas: result.cas
    });
    
    return result;
  } catch (error) {
    logger.errorWithContext(error, 'save_patient');
    throw error;
  }
};

const getPatient = async (id) => {
  try {
    const result = await collection.get(id);
    return result.content;
  } catch (error) {
    logger.errorWithContext(error, 'get_patient', { id });
    throw error;
  }
};

// CRUD operations for encounters
const saveEncounter = async (encounter) => {
  try {
    const key = encounter.id || `encounter_${Date.now()}`;
    const result = await collection.upsert(key, {
      ...encounter,
      type: 'encounter',
      created_at: encounter.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    logger.info('Encounter saved to Couchbase', {
      key,
      cas: result.cas
    });
    
    return result;
  } catch (error) {
    logger.errorWithContext(error, 'save_encounter');
    throw error;
  }
};

const getEncounter = async (id) => {
  try {
    const result = await collection.get(id);
    return result.content;
  } catch (error) {
    logger.errorWithContext(error, 'get_encounter', { id });
    throw error;
  }
};

// CRUD operations for vital signs
const saveVitalSigns = async (vitalSigns) => {
  try {
    const key = vitalSigns.id || `vitals_${Date.now()}`;
    const result = await collection.upsert(key, {
      ...vitalSigns,
      type: 'vital_signs',
      created_at: vitalSigns.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    logger.info('Vital signs saved to Couchbase', {
      key,
      cas: result.cas
    });
    
    return result;
  } catch (error) {
    logger.errorWithContext(error, 'save_vital_signs');
    throw error;
  }
};

const getVitalSigns = async (id) => {
  try {
    const result = await collection.get(id);
    return result.content;
  } catch (error) {
    logger.errorWithContext(error, 'get_vital_signs', { id });
    throw error;
  }
};

// CRUD operations for medications
const saveMedication = async (medication) => {
  try {
    const key = medication.id || `medication_${Date.now()}`;
    const result = await collection.upsert(key, {
      ...medication,
      type: 'medication',
      created_at: medication.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    logger.info('Medication saved to Couchbase', {
      key,
      cas: result.cas
    });
    
    return result;
  } catch (error) {
    logger.errorWithContext(error, 'save_medication');
    throw error;
  }
};

const getMedication = async (id) => {
  try {
    const result = await collection.get(id);
    return result.content;
  } catch (error) {
    logger.errorWithContext(error, 'get_medication', { id });
    throw error;
  }
};

// CRUD operations for lab results
const saveLabResult = async (labResult) => {
  try {
    const key = labResult.id || `lab_${Date.now()}`;
    const result = await collection.upsert(key, {
      ...labResult,
      type: 'lab_result',
      created_at: labResult.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    logger.info('Lab result saved to Couchbase', {
      key,
      cas: result.cas
    });
    
    return result;
  } catch (error) {
    logger.errorWithContext(error, 'save_lab_result');
    throw error;
  }
};

const getLabResult = async (sanitizedId) => {
  try {
    const result = await collection.get(sanitizedId);
    return result.content;
  } catch (error) {
    logger.errorWithContext(error, 'get_lab_result', { sanitizedId });
    throw error;
  }
};

// Search patients by query
const searchPatients = async (query) => {
  try {
    // Create a N1QL query to search patients
    const n1qlQuery = `
      SELECT * FROM ${bucket.name} 
      WHERE type = 'patient' 
      AND (name LIKE $1 OR phone LIKE $1 OR nhis_number LIKE $1)
    `;
    
    const result = await cluster.query(n1qlQuery, [`%${query}%`]);
    return result.rows;
  } catch (error) {
    logger.errorWithContext(error, 'search_patients', { query });
    throw error;
  }
};

// Sync specific item to Couchbase
const syncItemToCouchbase = async (item) => {
  try {
    const { table_name, record_id, operation } = item;
    
    // Get record data from SQLite database
    const { getQuery } = require('./database');
    const record = await getQuery(`SELECT * FROM ${table_name} WHERE id = ?`, [record_id]);
    
    if (!record) {
      throw new Error(`Record not found: ${table_name}/${record_id}`);
    }

    // Create Couchbase document
    const doc = {
      _id: `${table_name}_${record_id}`,
      table: table_name,
      record_id: record_id,
      operation: operation,
      data: record,
      timestamp: new Date().toISOString(),
      hospital_id: process.env.HOSPITAL_ID,
      version: 1
    };

    // Save to Couchbase
    const key = doc._id;
    const result = await collection.upsert(key, doc);
    
    logger.sync('Item synced to Couchbase', {
      tableName: table_name,
      recordId: record_id,
      operation,
      cas: result.cas
    });
    
  } catch (error) {
    logger.errorWithContext(error, 'sync_item_to_couchbase', {
      tableName: item.table_name,
      recordId: item.record_id,
      operation: item.operation
    });
    throw error;
  }
};

// Get pending sync items from SQLite
const getPendingSyncItems = async () => {
  try {
    const { allQuery } = require('./database');
    const items = await allQuery(`
      SELECT * FROM sync_status 
      WHERE sync_status = 'pending' 
      ORDER BY created_at ASC
    `);
    
    return items;
  } catch (error) {
    logger.errorWithContext(error, 'get_pending_sync_items');
    throw error;
  }
};

// Update sync status in SQLite
const updateSyncStatus = async (itemId, status, errorMessage = null) => {
  try {
    const { runSanitizedQuery } = require('./database');
    await runSanitizedQuery(`
      UPDATE sync_status 
      SET sync_status = ?, 
          last_sync_attempt = ?, 
          error_message = ?,
          updated_at = ?
      WHERE id = ?
    `, [
      status,
      new Date().toISOString(),
      errorMessage,
      new Date().toISOString(),
      itemId
    ]);
  } catch (error) {
    logger.errorWithContext(error, 'update_sync_status', {
      itemId,
      status
    });
    throw error;
  }
};

// Manual sync operation
const performManualSync = async () => {
  try {
    const startTime = Date.now();
    
    // Get pending sync items
    const pendingItems = await getPendingSyncItems();
    
    if (pendingItems.length === 0) {
      logger.sync('No pending items to sync');
      return { synced: 0, errors: 0 };
    }

    let synced = 0;
    let errors = 0;

    for (const item of pendingItems) {
      try {
        await syncItemToCouchbase(item);
        synced++;
        
        // Update sync status
        await updateSyncStatus(item.id, 'synced');
        
      } catch (error) {
        errors++;
        logger.errorWithContext(error, 'manual_sync_item', {
          itemId: item.id,
          tableName: item.table_name,
          operation: item.operation
        });
        
        // Update sync status with error
        await updateSyncStatus(item.id, 'failed', error.message);
      }
    }

    const duration = Date.now() - startTime;
    
    logger.sync('Manual sync completed', {
      synced,
      errors,
      duration
    });

    return { synced, errors, duration };
    
  } catch (error) {
    logger.errorWithContext(error, 'manual_sync');
    throw error;
  }
};

// Get sync status for specific record
const getSyncStatus = async (tableName, recordId) => {
  try {
    const { getQuery } = require('./database');
    const status = await getQuery(`
      SELECT * FROM sync_status 
      WHERE table_name = ? AND record_id = ?
      ORDER BY created_at DESC LIMIT 1
    `, [tableName, recordId]);
    
    return status;
  } catch (error) {
    logger.errorWithContext(error, 'get_sync_status', {
      tableName,
      recordId
    });
    throw error;
  }
};

// Get sync statistics
const getSyncStats = async () => {
  try {
    const { allQuery, getQuery } = require('./database');
    
    const stats = await allQuery(`
      SELECT 
        sync_status,
        COUNT(*) as count
      FROM sync_status 
      GROUP BY sync_status
    `);
    
    const totalItems = await getQuery(`
      SELECT COUNT(*) as total FROM sync_status
    `);
    
    const recentErrors = await allQuery(`
      SELECT * FROM sync_status 
      WHERE sync_status = 'failed' 
      ORDER BY last_sync_attempt DESC 
      LIMIT 10
    `);
    
    return {
      total: totalItems.total,
      byStatus: stats,
      recentErrors
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'get_sync_stats');
    throw error;
  }
};

module.exports = {
  initializeCouchbase,
  getCluster,
  getBucket,
  getCollection,
  isCouchbaseAvailable,
  savePatient,
  getPatient,
  saveEncounter,
  getEncounter,
  saveVitalSigns,
  getVitalSigns,
  saveMedication,
  getMedication,
  saveLabResult,
  getLabResult,
  searchPatients,
  performManualSanitizedSync: performManualSync,
  getSyncStatus,
  getSyncStats
};
