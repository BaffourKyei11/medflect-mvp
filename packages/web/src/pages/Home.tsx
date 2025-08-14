import React from 'react';
import { Link } from 'react-router-dom';
import { track } from '../services/analytics.ts';

export default function Home(){
  React.useEffect(()=>{ track('home_view'); },[]);
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <h1 className="text-2xl font-semibold">Welcome to Medflect</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">The Clinical Integration Flow now lives on the Dashboard.</p>
        <div className="mt-4 flex gap-3">
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          <Link to="/" className="btn border border-slate-300 dark:border-slate-700">Back to Landing</Link>
        </div>
      </div>
    </div>
  );
}
