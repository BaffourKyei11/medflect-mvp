import React, { useState } from 'react';
import { getAudit } from '../services/audit.ts';
import { Table } from '../components/Table.tsx';

export default function Audit(){
  const [items,setItems]=useState<any[]>([]);
  const [pid,setPid]=useState('');

  const load = async ()=>{
    const data = await getAudit({ patientId: pid||undefined, limit: 50 });
    setItems(Array.isArray(data)?data: (data?.items||[]));
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Audit</h2>
      <div className="mt-2 flex gap-2">
        <input className="input" placeholder="Patient ID (optional)" value={pid} onChange={e=>setPid(e.target.value)}/>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="mt-3">
        <Table headers={["When","Actor","Action","Target"]}>
          {items.map((a:any,idx:number)=> (
            <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
              <td className="py-2">{a.timestamp||a.time||'—'}</td>
              <td className="py-2">{a.actor||a.user||'—'}</td>
              <td className="py-2">{a.action||a.type||'—'}</td>
              <td className="py-2">{a.target||a.resource||'—'}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
