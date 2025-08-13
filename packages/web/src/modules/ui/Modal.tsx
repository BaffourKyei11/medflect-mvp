import React, { useEffect } from 'react';

export function Modal({open,onClose,children}:{open:boolean;onClose:()=>void;children:React.ReactNode}){
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    if(open) document.addEventListener('keydown',onKey);
    return ()=>document.removeEventListener('keydown',onKey);
  },[open,onClose]);
  if(!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        {children}
      </div>
    </div>
  );
}
