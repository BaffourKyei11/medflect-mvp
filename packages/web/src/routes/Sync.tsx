import React, { useEffect, useState } from 'react';
import { getSyncStatus, triggerSync } from '../services/sync.ts';
import { getCount, subscribe, flush } from '../services/queue.ts';
import { api } from '../services/api.ts';

export default function Sync(){
  const [status,setStatus]=useState<{ lastPush?: string; lastPull?: string; queued?: number }>({});
  const [busy,setBusy]=useState(false);
  const [localCount,setLocalCount]=useState(0);

  useEffect(()=>{
    let unsub = () => {};
    (async()=>{ setLocalCount(await getCount()); unsub = subscribe((c)=>setLocalCount(c)); })();
    return ()=>unsub();
  },[]);

  const refresh = async ()=>{
    setBusy(true);
    try{ const s = await getSyncStatus(); setStatus(s); } finally { setBusy(false); }
  };

  const run = async ()=>{
    setBusy(true);
    try{ await triggerSync(); await refresh(); } finally { setBusy(false); }
  };

  const flushLocal = async ()=>{
    setBusy(true);
    try{ await flush((cfg)=>api.request({ ...cfg, __queued:true } as any)); await refresh(); } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Sync</h2>
      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        <div>Queued: {status.queued ?? 0}</div>
        <div>Last Pull: {status.lastPull || '—'}</div>
        <div>Last Push: {status.lastPush || '—'}</div>
        <div>Local offline queue: {localCount}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn" onClick={refresh} disabled={busy}>Refresh</button>
        <button className="btn btn-primary" onClick={run} disabled={busy}>Trigger Sync</button>
        <button className="btn" onClick={flushLocal} disabled={busy || localCount<=0}>Flush local queue</button>
      </div>
    </div>
  );
}
