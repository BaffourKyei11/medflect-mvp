import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';

export function BottomNav(){
  const { pathname } = useLocation();
  const item=(to:string,label:string,Icon:any)=> (
    <Link to={to} className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs ${pathname===to?'text-brand-600 dark:text-brand-400':'text-slate-600 dark:text-slate-300'}`}>
      <Icon size={18}/><span>{label}</span>
    </Link>
  );
  return (
    <nav className="md:hidden sticky bottom-0 z-40 w-full border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-3 py-2">
        {item('/dashboard','Patients',Users)}
        {item('/consent','Consent + Audit',Shield)}
        <span />
      </div>
    </nav>
  );
}
