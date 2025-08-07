import React, { useEffect, useState } from 'react';
import { getConsent, upsertConsent } from '../services/consent.ts';

export default function Consent(){
  const [patientId,setPatientId]=useState('');
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState('');

  const load = async ()=>{
    if(!patientId) return;
    setLoading(true); setMsg('');
    try{ const d = await getConsent(patientId); setData(d); } finally { setLoading(false); }
  };

  const save = async ()=>{
    setLoading(true); setMsg('');
    try{
      const res: any = await upsertConsent({ patientId, consent: data?.consent||'read' });
      const queued = res && (res.queued === true);
      setMsg(queued ? 'Saved (queued)' : 'Saved');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ setData(null); },[patientId]);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Consent</h2>
      <div className="mt-3 flex gap-2">
        <input className="input" placeholder="Patient ID" value={patientId} onChange={e=>setPatientId(e.target.value)}/>
        <button className="btn" onClick={load} disabled={!patientId||loading}>Load</button>
      </div>
      {data && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="text-slate-500">Current consent</div>
          <input className="input" value={data?.consent||''} onChange={e=>setData({...data, consent:e.target.value})}/>
          <div className="flex gap-2"><button className="btn btn-primary" onClick={save} disabled={loading}>Save</button></div>
          {msg && <div className="text-sky-600">{msg}</div>}
        </div>
      )}
    </div>
  );
}
