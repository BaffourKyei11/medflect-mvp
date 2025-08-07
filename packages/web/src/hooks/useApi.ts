import { useEffect, useState } from 'react';

export function useApi<T>(fn: () => Promise<T>, deps: any[] = []){
  const [data,setData]=useState<T|undefined>();
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|undefined>();
  useEffect(()=>{ let active=true; setLoading(true); setError(undefined);
    fn().then(d=>{ if(active) setData(d); }).catch(e=>{ if(active) setError(e?.message||'Error'); }).finally(()=>{ if(active) setLoading(false); });
    return ()=>{ active=false };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error } as const;
}
