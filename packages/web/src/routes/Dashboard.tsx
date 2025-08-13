import React from 'react';
import { useApi } from '../hooks/useApi.ts';
import { getDashboard } from '../services/dashboard.ts';
import { LoadingSkeleton } from '../components/LoadingSkeleton.tsx';
import { ErrorState } from '../components/ErrorState.tsx';

export default function Dashboard(){
  const { data, loading, error } = useApi(getDashboard, []);

  if(loading) return <LoadingSkeleton lines={6}/>;
  if(error) return <ErrorState message={error}/>;

  const kpis = data?.kpis || [];
  const alerts = data?.alerts || [];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k)=> (
          <div key={k.label} className="card">
            <div className="text-sm text-slate-500">{k.label}</div>
            <div className="mt-2 text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      {alerts.length>0 && (
        <div className="card">
          <h3 className="text-lg font-semibold">Alerts</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {alerts.map((a:string, i:number)=> (<li key={i}>{a}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
