import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="w-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-4 py-2 text-sm">
      You are offline. Changes will be queued and synced automatically when back online.
    </div>
  );
};
