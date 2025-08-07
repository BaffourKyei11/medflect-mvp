// Groq Prompt: Auto Background Sync Hook
// Tool: useAutoSync
// Description: React hook for auto-starting/stopping sync based on network
import { useEffect } from 'react';
import { startSync, stopSync } from './clientSync';

export default function useAutoSync() {
  useEffect(() => {
    function handleOnline() { startSync(); }
    function handleOffline() { stopSync(); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    startSync();
    return () => {
      stopSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
