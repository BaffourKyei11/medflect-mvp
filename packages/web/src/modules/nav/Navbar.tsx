import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Users, Shield } from 'lucide-react';
import { getCount, subscribe } from '../../services/queue.ts';
import { getAiStatus, type AiStatus } from '../../services/ai.ts';

export function Navbar({ right }: { right?: React.ReactNode }) {
  const [qCount,setQCount]=useState(0);
  const [ai, setAi] = useState<AiStatus | null>(null);
  useEffect(()=>{
    let unsub = () => {};
    (async()=>{ setQCount(await getCount()); unsub = subscribe((c)=>setQCount(c)); })();
    return ()=>unsub();
  },[]);
  useEffect(()=>{
    (async()=>{ try { setAi(await getAiStatus()); } catch { /* ignore */ } })();
  },[]);
  const { pathname } = useLocation();
  const link = (to: string, label: string, Icon: any) => (
    <Link to={to} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 ${pathname===to?'text-brand-600 dark:text-brand-400':'text-slate-700 dark:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div className="container mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="text-brand-600" />
          <span>Medflect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {link('/','Home',Users)}
          {link('/dashboard','Dashboard',Users)}
          {link('/consent','Consent + Audit',Shield)}
        </nav>
        <div className="flex items-center gap-2">
          {ai && (
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${ai.mock? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${ai.mock? 'bg-amber-500':'bg-emerald-500'}`} aria-hidden/>
              AI: {ai.mock? 'Mock':'Live'}
            </span>
          )}
          {qCount>0 && (
            <Link to="/sync" className="relative inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" aria-hidden/>
              {qCount} queued
            </Link>
          )}
          {right}
        </div>
      </div>
    </header>
  );
}
