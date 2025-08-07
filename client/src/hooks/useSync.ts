import { useState, useEffect, useCallback } from 'react';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  pendingChanges: number;
  error: string | null;
}

export const useSync = () => {
  const [state, setState] = useState<SyncState>({
    status: 'idle',
    lastSyncTime: null,
    pendingChanges: 0,
    error: null
  });

  const sync = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'syncing', error: null }));
    
    try {
      // Mock sync operation - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.1) {
        setState(prev => ({
          ...prev,
          status: 'success',
          lastSyncTime: new Date(),
          pendingChanges: 0
        }));
      } else {
        throw new Error('Sync failed - network timeout');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown sync error'
      }));
    }
  }, []);

  const addPendingChange = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, []);

  // Auto-sync when online and has pending changes
  useEffect(() => {
    const shouldAutoSync = navigator.onLine && state.pendingChanges > 0 && state.status === 'idle';
    
    if (shouldAutoSync) {
      const timer = setTimeout(() => {
        sync();
      }, 5000); // Auto-sync after 5 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [state.pendingChanges, state.status, sync]);

  return {
    syncStatus: state.status,
    lastSyncTime: state.lastSyncTime,
    pendingChanges: state.pendingChanges,
    error: state.error,
    sync,
    addPendingChange
  };
};
