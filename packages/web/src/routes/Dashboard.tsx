import React from 'react';
import { useApi } from '../hooks/useApi.ts';
import { getDashboard } from '../services/dashboard.ts';
import { LoadingSkeleton } from '../components/LoadingSkeleton.tsx';
import { ErrorState } from '../components/ErrorState.tsx';
import { track } from '../services/analytics.ts';
import { Link } from 'react-router-dom';
import ClinicalIntegrationFlow from '../components/ClinicalIntegrationFlow.tsx';
import { getAiStatus } from '../services/ai.ts';

export default function Dashboard(){
  const { data, loading, error } = useApi(getDashboard, []);
  React.useEffect(() => { track('dashboard_view'); }, []);
  const [aiInfo, setAiInfo] = React.useState<{ mock: boolean; model?: string|null } | null>(null);
  React.useEffect(()=>{ (async()=>{ try{ setAiInfo(await getAiStatus()); } catch{} })(); },[]);

  if(loading) return <LoadingSkeleton lines={6}/>;
  if(error) return <ErrorState message={error}/>;

  const kpis = data?.kpis || [];
  const alerts = data?.alerts || [];

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-slate-200 bg-white/70 p-3 text-sm shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${aiInfo?.mock? 'bg-amber-500':'bg-emerald-500'}`}></span>
            AI: {aiInfo ? (aiInfo.mock? 'Mock':'Live') : '...'}{aiInfo?.model? ` • ${aiInfo.model}`:''}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k)=> (
          <div key={k.label} className="card">
            <div className="text-sm text-slate-500">{k.label}</div>
            <div className="mt-2 text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold">Quick actions</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Link to="/patients" className="btn btn-primary text-center">Patients</Link>
          <Link to="/consent" className="btn text-center border border-slate-300 dark:border-slate-700">Consent + Audit</Link>
          <Link to="/sync" className="btn text-center border border-slate-300 dark:border-slate-700">Sync</Link>
        </div>
      </div>

      {/* Clinical Integration Flow embedded in Dashboard */}
      <ClinicalIntegrationFlow />
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
