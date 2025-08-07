import { useState, useEffect } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineDuration: number;
}

export const useOffline = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    offlineDuration: 0
  });

  useEffect(() => {
    let offlineStartTime: number | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      const offlineDuration = offlineStartTime ? Date.now() - offlineStartTime : 0;
      setState(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        offlineDuration
      }));
      
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      offlineStartTime = null;
    };

    const handleOffline = () => {
      offlineStartTime = Date.now();
      setState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true
      }));

      // Update offline duration every second
      intervalId = setInterval(() => {
        if (offlineStartTime) {
          setState(prev => ({
            ...prev,
            offlineDuration: Date.now() - offlineStartTime!
          }));
        }
      }, 1000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize offline duration if already offline
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return state;
};
