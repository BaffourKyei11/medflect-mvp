// Sync service using Couchbase
const { logger } = require('../utils/logger');
const { runQuery, getQuery, allQuery } = require('./database');
const couchbaseService = require('./couchbase');

const { 
  initializeCouchbase, 
  getCollection, 
  performManualSanitizedSync,
  getCouchbaseSyncStatus,
  getCouchbaseSyncStats
} = couchbaseService;

let couchbaseCollection;
let syncHandler;

// Initialize sync service
const initializeSync = async () => {
  try {
    // Initialize Couchbase connection
    await initializeCouchbase();
    
    // Get Couchbase collection
    couchbaseCollection = getCollection();
    
    // Test remote connection
    await testRemoteConnection();
    
    // Start sync
    await startSync();
    
    logger.success('Sync service initialized successfully');
    
  } catch (error) {
    logger.errorWithContext(error, 'sync_initialization');
    throw error;
  }
};

// Test remote database connection
const testRemoteConnection = async () => {
  try {
    // In a real implementation, this would test the Couchbase connection
    logger.sync('Remote database connection would be successful with Couchbase');
  } catch (error) {
    logger.warning('Remote database connection failed, sync will be disabled', {
      error: error.message
    });
    throw error;
  }
};

// Start bidirectional sync
const startSync = async () => {
  try {
    // In a real implementation, this would start live sync with Couchbase
    logger.success('Bidirectional sync ready for Couchbase implementation');
    
  } catch (error) {
    logger.errorWithContext(error, 'sync_start');
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
        await syncItem(item);
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

// Sync specific item
const syncItem = async (item) => {
  try {
    const { table_name, record_id, operation } = item;
    
    // Get record data
    const record = await getRecordData(table_name, record_id);
    
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

    // Add to Couchbase
    if (couchbaseCollection) {
      const key = doc._id;
      await couchbaseCollection.upsert(key, doc);
    }
    
    logger.sync('Item synced to Couchbase', {
      tableName: table_name,
      recordId: record_id,
      operation
    });
    
  } catch (error) {
    logger.errorWithContext(error, 'sync_item', {
      tableName: item.table_name,
      recordId: item.record_id,
      operation: item.operation
    });
    throw error;
  }
};

// Get pending sync items
const getPendingSyncItems = async () => {
  try {
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

// Get record data from database
const getRecordData = async (tableName, recordId) => {
  try {
    const record = await getQuery(`SELECT * FROM ${tableName} WHERE id = ?`, [recordId]);
    return record;
  } catch (error) {
    logger.errorWithContext(error, 'get_record_data', {
      tableName,
      recordId
    });
    throw error;
  }
};

// Update sync status
const updateSyncStatus = async (itemId, status, errorMessage = null) => {
  try {
    await runQuery(`
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

// Add item to sync queue
const addToSyncQueue = async (tableName, recordId, operation) => {
  try {
    const itemId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await runQuery(`
      INSERT INTO sync_status (
        id, table_name, record_id, operation, sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      itemId,
      tableName,
      recordId,
      operation,
      'pending',
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    logger.sync('Item added to sync queue', {
      itemId,
      tableName,
      recordId,
      operation
    });

    return itemId;
    
  } catch (error) {
    logger.errorWithContext(error, 'add_to_sync_queue', {
      tableName,
      recordId,
      operation
    });
    throw error;
  }
};

// Get sync status for specific record
const getSyncStatus = async (tableName, recordId) => {
  try {
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
    const stats = await getQuery(`
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

// Resolve sync conflicts
const resolveSyncConflict = async (conflict) => {
  try {
    const { doc, conflicts } = conflict;
    
    // Get the most recent version
    const versions = [doc, ...conflicts];
    const sortedVersions = versions.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    const resolvedDoc = {
      ...sortedVersions[0],
      _conflicts: undefined,
      timestamp: new Date().toISOString()
    };
    
    // Save resolved document
    if (couchbaseCollection) {
      const key = resolvedDoc._id;
      await couchbaseCollection.upsert(key, resolvedDoc);
    }
    
    logger.sync('Sync conflict resolved', {
      docId: doc._id,
      conflictCount: conflicts.length
    });
    
    return resolvedDoc;
    
  } catch (error) {
    logger.errorWithContext(error, 'resolve_sync_conflict');
    throw error;
  }
};

// Handle offline mode
const handleOfflineMode = async () => {
  try {
    // Check if we're offline
    const isOnline = await checkOnlineStatus();
    
    if (!isOnline) {
      logger.sync('Operating in offline mode');
      
      // Queue all local changes for later sync
      const localChanges = await getLocalChanges();
      
      for (const change of localChanges) {
        await addToSyncQueue(
          change.table,
          change.record_id,
          change.operation
        );
      }
      
      return { mode: 'offline', queuedChanges: localChanges.length };
    }
    
    return { mode: 'online' };
    
  } catch (error) {
    logger.errorWithContext(error, 'handle_offline_mode');
    throw error;
  }
};

// Check online status
const checkOnlineStatus = async () => {
  try {
    // In a real implementation, this would check the Couchbase connection
    return true;
  } catch (error) {
    return false;
  }
};

// Get local changes
const getLocalChanges = async () => {
  try {
    // In a real implementation, this would get local changes from Couchbase
    return [];
  } catch (error) {
    logger.errorWithContext(error, 'get_local_changes');
    throw error;
  }
};

// Stop sync
const stopSync = async () => {
  try {
    if (syncHandler) {
      syncHandler.cancel();
      logger.sync('Sync stopped');
    }
  } catch (error) {
    logger.errorWithContext(error, 'stop_sync');
    throw error;
  }
};

// Get local database instance
const getLocalDB = () => {
  return null;
};

// Get remote database instance
const getRemoteDB = () => {
  return null;
};

// Check if sync is available
const isSyncAvailable = () => {
  return !!(couchbaseCollection);
};

module.exports = {
  initializeSync,
  performManualSync: performManualSanitizedSync,
  syncItem,
  addToSyncQueue,
  getSyncStatus: getCouchbaseSyncStatus,
  getSyncStats: getCouchbaseSyncStats,
  resolveSyncConflict,
  handleOfflineMode,
  checkOnlineStatus,
  stopSync,
  isSyncAvailable
}; 