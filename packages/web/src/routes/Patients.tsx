import React, { useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi.ts';
import { listPatients } from '../services/patients.ts';
import { Link } from 'react-router-dom';
import { Table } from '../components/Table.tsx';
import { LoadingSkeleton } from '../components/LoadingSkeleton.tsx';
import { ErrorState } from '../components/ErrorState.tsx';

export default function Patients(){
  const [q,setQ]=useState('');
  const [page,setPage]=useState(1);
  const params = useMemo(()=>({ search:q||undefined, page, limit:10 }),[q,page]);
  const { data, loading, error } = useApi(()=>listPatients(params), [q,page]);

  if(loading) return <LoadingSkeleton lines={6}/>;
  if(error) return <ErrorState message={error}/>;

  const items = data?.items||[];
  const total = data?.total||0;

  return (
    <div className="card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Patients</h2>
        <input className="input max-w-xs" placeholder="Search patients" value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/>
      </div>
      <div className="mt-4">
        <Table headers={["Name","Age","Sex","Actions"]}>
          {items.map(p=> (
            <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
              <td className="py-2">{p.name||p.id}</td>
              <td className="py-2">{p.age??'—'}</td>
              <td className="py-2 capitalize">{p.sex??'—'}</td>
              <td className="py-2"><Link className="link" to={`/patients/${p.id}`}>Open</Link></td>
            </tr>
          ))}
        </Table>
        <div className="mt-3 flex items-center justify-between text-sm">
          <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</button>
          <div>Page {page} • Total {total}</div>
          <button className="btn" onClick={()=>setPage(p=>p+1)} disabled={items.length<10}>Next</button>
        </div>
      </div>
    </div>
  );
}
