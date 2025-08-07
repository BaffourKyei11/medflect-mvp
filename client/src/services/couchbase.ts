// Couchbase service for frontend local storage
// This service provides a Couchbase-compatible interface for local storage
// that can work both online and offline

// Types
interface Patient {
  _id?: string;
  id?: string;
  mrn: string;
  name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  nhis_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface Encounter {
  _id?: string;
  id?: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  type: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface SyncStatus {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  sync_status: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Database instances (using localStorage as a temporary solution)
let isInitialized = false;

// Initialize Couchbase service
export const initializeCouchbase = async () => {
  try {
    // In a real implementation, this would initialize the Couchbase client
    // For now, we're just setting the initialization flag
    isInitialized = true;
    console.log('Couchbase service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Couchbase service:', error);
    throw error;
  }
};

// Check if Couchbase is initialized
const checkInitialization = () => {
  if (!isInitialized) {
    throw new Error('Couchbase not initialized. Call initializeCouchbase first.');
  }
};

// Utility functions for localStorage operations
const getLocalStorageKey = (type: string, id: string) => {
  return `medflect_${type}_${id}`;
};

const getLocalStorageItemsByType = (type: string) => {
  const items: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`medflect_${type}_`)) {
      const item = localStorage.getItem(key);
      if (item) {
        items.push(JSON.parse(item));
      }
    }
  }
  return items;
};

// CRUD operations for patients
export const savePatient = async (patient: Patient) => {
  checkInitialization();
  
  const id = patient._id || patient.id || `patient_${Date.now()}`;
  const doc = {
    ...patient,
    _id: id,
    type: 'patient',
    created_at: patient.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(getLocalStorageKey('patient', id), JSON.stringify(doc));
  return { id, ok: true };
};

export const getPatient = async (id: string) => {
  checkInitialization();
  
  const item = localStorage.getItem(getLocalStorageKey('patient', id));
  if (!item) {
    throw new Error(`Patient not found: ${id}`);
  }
  
  return JSON.parse(item);
};

export const searchPatients = async (query: string) => {
  checkInitialization();
  
  const patients = getLocalStorageItemsByType('patient');
  const regex = new RegExp(query, 'i');
  
  return patients.filter(patient => 
    regex.test(patient.name) || 
    regex.test(patient.phone) || 
    regex.test(patient.nhis_number)
  );
};

// CRUD operations for encounters
export const saveEncounter = async (encounter: Encounter) => {
  checkInitialization();
  
  const id = encounter._id || encounter.id || `encounter_${Date.now()}`;
  const doc = {
    ...encounter,
    _id: id,
    type: 'encounter',
    created_at: encounter.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(getLocalStorageKey('encounter', id), JSON.stringify(doc));
  return { id, ok: true };
};

export const getEncounter = async (id: string) => {
  checkInitialization();
  
  const item = localStorage.getItem(getLocalStorageKey('encounter', id));
  if (!item) {
    throw new Error(`Encounter not found: ${id}`);
  }
  
  return JSON.parse(item);
};

// Sync functions for when online
export const syncWithRemote = async (remoteUrl: string) => {
  checkInitialization();
  
  try {
    // In a real implementation, this would sync with a Couchbase server
    // For now, we're just logging that sync would happen
    console.log(`Would sync with remote Couchbase server at: ${remoteUrl}`);
    
    // Get all items that need to be synced
    const syncItems = getLocalStorageItemsByType('sync');
    
    // Process each sync item
    for (const item of syncItems) {
      if (item.sync_status === 'pending') {
        // In a real implementation, this would send the item to the remote server
        console.log(`Syncing item: ${item.id}`);
        
        // Update sync status (simulated)
        const updatedItem = {
          ...item,
          sync_status: 'synced',
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(getLocalStorageKey('sync', item.id), JSON.stringify(updatedItem));
      }
    }
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

// Add item to sync queue
export const addToSyncQueue = async (tableName: string, recordId: string, operation: string) => {
  checkInitialization();
  
  try {
    const itemId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const syncItem = {
      id: itemId,
      table_name: tableName,
      record_id: recordId,
      operation: operation,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(getLocalStorageKey('sync', itemId), JSON.stringify(syncItem));
    
    console.log('Item added to sync queue', {
      itemId,
      tableName,
      recordId,
      operation
    });

    return itemId;
    
  } catch (error) {
    console.error('Failed to add item to sync queue:', error);
    throw error;
  }
};

// Get sync status for specific record
export const getSyncStatus = async (tableName: string, recordId: string) => {
  checkInitialization();
  
  const syncItems = getLocalStorageItemsByType('sync');
  const item = syncItems.find(item => 
    item.table_name === tableName && item.record_id === recordId
  );
  
  return item || null;
};
