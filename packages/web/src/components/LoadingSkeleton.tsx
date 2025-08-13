import React from 'react';

export const LoadingSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_,i)=>(
      <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700"/>
    ))}
  </div>
);
