import React from 'react';

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
    <div className="flex items-center justify-between">
      <p>{message || 'Something went wrong.'}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Retry</button>}
    </div>
  </div>
);
