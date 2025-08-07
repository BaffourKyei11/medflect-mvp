import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'medflect-queue';
const STORE = 'requests';

export type QItem = {
  id: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string,string>;
  createdAt: number;
};

let dbPromise: Promise<IDBPDatabase<any>> | null = null;
const ensureDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      }
    });
  }
  return dbPromise;
};

const listeners = new Set<(count: number) => void>();
const notify = async () => {
  const db = await ensureDB();
  const count = await (db as any).count(STORE);
  listeners.forEach((fn) => fn(count || 0));
};

export async function enqueue(item: Omit<QItem,'id'|'createdAt'>){
  const db = await ensureDB();
  const id = crypto.randomUUID();
  await (db as any).put(STORE, { ...item, id, createdAt: Date.now() });
  await notify();
}

export async function getCount(){
  const db = await ensureDB();
  const count = await (db as any).count(STORE);
  return count || 0;
}

export async function flush(request: (cfg: { url: string; method: string; data?: any; headers?: any }) => Promise<any>){
  const db = await ensureDB();
  const tx = (db as any).transaction(STORE, 'readwrite');
  const store = tx.store;
  const all: QItem[] = await store.getAll();
  for (const it of all){
    try {
      await request({ url: it.url, method: it.method, data: it.data, headers: it.headers });
      await store.delete(it.id);
    } catch (e) {
      // stop on first failure to avoid rapid retries
      throw e;
    }
  }
  await tx.done;
  await notify();
}

export function subscribe(fn: (count: number)=>void){ listeners.add(fn); return () => listeners.delete(fn); }

// auto-flush when back online
if (typeof window !== 'undefined'){
  window.addEventListener('online', () => notify());
}

// Simple backoff scheduler
let timer: number | undefined;
let attempt = 0;
export function scheduleFlush(run: () => Promise<void>){
  if (timer) return; // already scheduled
  const delay = Math.min(30000, 1000 * Math.pow(2, attempt)); // 1s,2s,4s,... max 30s
  // @ts-ignore browser timer typing
  timer = window.setTimeout(async () => {
    timer = undefined;
    try{
      await run();
      attempt = 0;
    }catch{
      attempt++;
      scheduleFlush(run);
    }
  }, delay);
}
