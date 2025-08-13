import React, { useEffect, useState } from 'react';

export function OfflineIndicator(){
  const [online,setOnline]=useState<boolean>(navigator.onLine);
  useEffect(()=>{
    const up=()=>setOnline(true); const down=()=>setOnline(false);
    window.addEventListener('online',up); window.addEventListener('offline',down);
    return ()=>{window.removeEventListener('online',up); window.removeEventListener('offline',down)}
  },[]);
  if(online) return null;
  return (
    <div role="status" aria-live="assertive" className="w-full bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
      <div className="container mx-auto max-w-6xl px-4 py-2 text-sm">You are offline. Changes will sync when connection is restored.</div>
    </div>
  );
}
