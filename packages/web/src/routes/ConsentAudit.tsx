import React, { useEffect, useMemo, useState } from 'react';
import { getConsent, upsertConsent } from '../services/consent.ts';
import { getAudit } from '../services/audit.ts';
import { Table } from '../components/Table.tsx';

export default function ConsentAudit(){
  const [patientId,setPatientId]=useState('');
  const [data,setData]=useState<any>(null);
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState('');
  const [items,setItems]=useState<any[]>([]);
  const [error,setError]=useState('');

  const canLoad = useMemo(()=>patientId.trim().length>0,[patientId]);

  const loadAll = async ()=>{
    if(!canLoad) return;
    setLoading(true); setMsg(''); setError('');
    try{
      const [c, a] = await Promise.all([
        getConsent(patientId),
        getAudit({ patientId, limit: 200 }),
      ]);
      setData(c);
      setItems(Array.isArray(a)?a:(a?.items||[]));
    } catch(e:any){ setError(e?.message||'Failed to load data'); }
    finally { setLoading(false); }
  };

  const save = async ()=>{
    if(!canLoad) return;
    setSaving(true); setMsg('');
    try{
      const res: any = await upsertConsent({ patientId, consent: data?.consent||'read' });
      const queued = res && (res.queued === true);
      setMsg(queued ? 'Saved (queued)' : 'Saved');
      await loadAll();
    } finally { setSaving(false); }
  };

  useEffect(()=>{ setData(null); setItems([]); setMsg(''); setError(''); },[patientId]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Consent + Audit</h2>
          <div className="flex items-center gap-2">
            <input className="input" placeholder="Patient ID" value={patientId} onChange={e=>setPatientId(e.target.value)}/>
            <button className="btn" onClick={loadAll} disabled={!canLoad||loading}>{loading?'Loading…':'Load'}</button>
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden/>
              Blockchain: Pending integration
            </span>
          </div>
        </div>
        {error && <div className="mt-2 text-rose-600 text-sm">{error}</div>}
        {msg && <div className="mt-2 text-sky-600 text-sm">{msg}</div>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="text-base font-semibold">Consent</h3>
          {!data && !loading && (
            <div className="mt-2 text-sm text-slate-500">Enter a Patient ID and click Load to view consent.</div>
          )}
          {data && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-slate-500">Current consent</div>
              <input className="input" value={data?.consent||''} onChange={e=>setData({...data, consent:e.target.value})}/>
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className={`btn ${data?.consent==='none'?'btn-primary':''}`} onClick={()=>setData({...data, consent:'none'})}>None</button>
                <button type="button" className={`btn ${data?.consent==='read'?'btn-primary':''}`} onClick={()=>setData({...data, consent:'read'})}>Read</button>
                <button type="button" disabled className="btn opacity-60 cursor-not-allowed" title="Coming soon">Clinical (soon)</button>
                <button type="button" disabled className="btn opacity-60 cursor-not-allowed" title="Coming soon">Research (soon)</button>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
              </div>
            </div>
          )}
        </div>

        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Audit</h3>
            <button className="btn" onClick={loadAll} disabled={!canLoad||loading}>{loading?'Refreshing…':'Refresh'}</button>
          </div>
          <div className="mt-3">
            <Table headers={["When","Actor","Action","Target"]}>
              {items.length===0 && (
                <tr className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-3 text-slate-500" colSpan={4}>No entries</td>
                </tr>
              )}
              {items.map((a:any,idx:number)=> (
                <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-2">{a.timestamp||a.time||a._ts||'—'}</td>
                  <td className="py-2">{a.actor||a.user||'—'}</td>
                  <td className="py-2">{a.action||a.type||a.event||'—'}</td>
                  <td className="py-2">{a.target||a.resource||'—'}</td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
