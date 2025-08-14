import React, { useEffect, useState } from 'react';
import { getAudit } from '../services/audit.ts';

type Entry = {
  _ts?: string;
  event?: string;
  patientId?: string;
  consent?: string;
  result?: boolean;
};

export function ConsentLog(){
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true); setError('');
    try{
      const data = await getAudit({ limit: 200 });
      setItems(Array.isArray(data) ? data : []);
    }catch(e:any){
      setError(e?.message || 'Failed to load audit');
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Consent Log</h2>
        <button className="btn" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="mt-2 text-rose-600 text-sm">{error}</div>}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Timestamp</th>
              <th className="py-2">Patient</th>
              <th className="py-2">Action</th>
              <th className="py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr className="border-t border-slate-100 dark:border-slate-700">
                <td className="py-3 text-slate-500" colSpan={4}>No entries</td>
              </tr>
            )}
            {items.map((e, i) => (
              <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                <td className="py-2">{e._ts || ''}</td>
                <td className="py-2">{e.patientId || ''}</td>
                <td className="py-2">{e.event || ''} → {e.consent || ''}</td>
                <td className="py-2">{e.result ? 'OK' : 'ERR'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
