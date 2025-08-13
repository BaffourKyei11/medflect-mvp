import { useEffect, useRef, useState } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'medflect-queue';
const STORE = 'requests';

type QItem = { id: string; url: string; method: string; body?: any; headers?: any; createdAt: number };

export function useSyncQueue(){
  const [queued,setQueued]=useState(0);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(()=>{(async()=>{
    const db = await openDB(DB_NAME, 1, { upgrade(db){ db.createObjectStore(STORE, { keyPath: 'id' }); } });
    // @ts-ignore
    dbRef.current = db;
    const count = await (db as any).count(STORE);
    setQueued(count || 0);
  })()},[]);

  const enqueue = async (item: Omit<QItem,'id'|'createdAt'>) => {
    const db: any = dbRef.current; if(!db) return;
    const id = crypto.randomUUID();
    await db.put(STORE, { ...item, id, createdAt: Date.now() });
    const count = await db.count(STORE); setQueued(count || 0);
  };

  const clear = async () => {
    const db: any = dbRef.current; if(!db) return;
    await db.clear(STORE); setQueued(0);
  };

  return { queued, enqueue, clear } as const;
}
