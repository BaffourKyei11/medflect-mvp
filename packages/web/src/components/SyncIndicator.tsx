import React, { useEffect, useState } from 'react';
import { getCount, subscribe, flush } from '../services/queue.ts';
import { api } from '../services/api.ts';

export const SyncIndicator: React.FC = () => {
  const [count,setCount]=useState(0);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    let unsub = () => {};
    (async()=>{
      setCount(await getCount());
      unsub = subscribe((c)=>setCount(c));
    })();
    return ()=>unsub();
  },[]);

  if(count<=0) return null;

  const run = async ()=>{
    setBusy(true);
    try { await flush((cfg)=>api.request({ ...cfg, __queued: true } as any)); } finally { setBusy(false); }
  };

  return (
    <div className="w-full bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
      <div className="container mx-auto max-w-6xl px-4 py-2 text-sm flex items-center justify-between">
        <span aria-live="polite">{count} change{count>1?'s':''} queued for sync</span>
        <button className="btn btn-primary" onClick={run} disabled={busy}>{busy?'Syncing...':'Sync now'}</button>
      </div>
    </div>
  );
};
