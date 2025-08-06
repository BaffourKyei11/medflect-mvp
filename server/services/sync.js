const PouchDB = require('pouchdb');
const { logger } = require('../utils/logger');
const { runQuery, getQuery, allQuery } = require('./database');

let localDB;
let remoteDB;
let syncHandler;

// Initialize sync service
const initializeSync = async () => {
  try {
    // Initialize local PouchDB
    localDB = new PouchDB('medflect-local');
    
    // Initialize remote database connection
    const syncUrl = process.env.POUCHDB_SYNC_URL || 'http://localhost:3001/api/sync';
    remoteDB = new PouchDB(syncUrl);
    
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
    const info = await remoteDB.info();
    logger.sync('Remote database connection successful', {
      dbName: info.db_name,
      docCount: info.doc_count,
      updateSeq: info.update_seq
    });
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
    // Start live sync
    syncHandler = localDB.sync(remoteDB, {
      live: true,
      retry: true,
      back_off_function: (delay) => {
        return Math.min(delay * 1.5, 10000);
      }
    });

    // Handle sync events
    syncHandler
      .on('change', (change) => {
        logger.sync('Sync change detected', {
          direction: change.direction,
          changeCount: change.change.docs.length
        });
      })
      .on('paused', (err) => {
        logger.sync('Sync paused', { error: err?.message });
      })
      .on('active', () => {
        logger.sync('Sync active');
      })
      .on('error', (err) => {
        logger.errorWithContext(err, 'sync_error');
      })
      .on('complete', (info) => {
        logger.sync('Sync completed', {
          docsRead: info.docs_read,
          docsWritten: info.docs_written,
          docWriteFailures: info.doc_write_failures
        });
      });

    logger.success('Bidirectional sync started');
    
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

    // Create PouchDB document
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

    // Add to local PouchDB
    await localDB.put(doc);
    
    logger.sync('Item synced to local database', {
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
    await localDB.put(resolvedDoc);
    
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
    await remoteDB.info();
    return true;
  } catch (error) {
    return false;
  }
};

// Get local changes
const getLocalChanges = async () => {
  try {
    const changes = await localDB.changes({
      since: 'now',
      include_docs: true
    });
    
    return changes.results.map(change => ({
      id: change.id,
      table: change.doc.table,
      record_id: change.doc.record_id,
      operation: change.doc.operation,
      timestamp: change.doc.timestamp
    }));
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
  return localDB;
};

// Get remote database instance
const getRemoteDB = () => {
  return remoteDB;
};

// Check if sync is available
const isSyncAvailable = () => {
  return !!(localDB && remoteDB);
};

module.exports = {
  initializeSync,
  performManualSync,
  syncItem,
  addToSyncQueue,
  getSyncStatus,
  getSyncStats,
  resolveSyncConflict,
  handleOfflineMode,
  checkOnlineStatus,
  stopSync,
  getLocalDB,
  getRemoteDB,
  isSyncAvailable
}; 