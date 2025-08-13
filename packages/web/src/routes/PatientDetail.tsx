import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.ts';
import { getPatient } from '../services/patients.ts';
import { ErrorState } from '../components/ErrorState.tsx';
import { LoadingSkeleton } from '../components/LoadingSkeleton.tsx';

export default function PatientDetail(){
  const { id = '' } = useParams();
  const { data, loading, error } = useApi(()=>getPatient(id), [id]);

  if(loading) return <LoadingSkeleton lines={6}/>;
  if(error) return <ErrorState message={error}/>;
  const p = data!;

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{p.name||'Patient'} <span className="text-slate-400">#{p.id}</span></h2>
          <Link className="btn" to={`/patients/${p.id}/ai`}>Generate AI Summary</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-slate-500">Age</div><div>{p.age??'—'}</div></div>
          <div><div className="text-slate-500">Sex</div><div className="capitalize">{p.sex??'—'}</div></div>
        </div>
      </div>
    </div>
  );
}
