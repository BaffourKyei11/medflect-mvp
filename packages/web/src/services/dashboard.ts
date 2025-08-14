import { api } from './api.ts';

export const getDashboard = async () => {
  // Simple IndexedDB cache for offline-first behavior
  // Reuse idb already in the project without adding new deps here by doing a dynamic import only when needed
  type Dash = { kpis: Array<{ label: string; value: number }>; alerts?: string[] };
  const DB_NAME = 'medflect-dashboard';
  const STORE = 'latest';

  const readCache = async (): Promise<Dash | undefined> => {
    try {
      const { openDB } = await import('idb');
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        }
      });
      const val = await (db as any).get(STORE, 'data');
      return val || undefined;
    } catch {
      return undefined;
    }
  };

  const writeCache = async (data: Dash) => {
    try {
      const { openDB } = await import('idb');
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        }
      });
      await (db as any).put(STORE, data, 'data');
    } catch {
      // ignore cache failures
    }
  };

  try {
    const { data } = await api.get('/dashboard');
    await writeCache(data as Dash);
    return data as Dash;
  } catch (e) {
    // On network errors or offline, return cached data if available
    const cached = await readCache();
    if (cached) return cached;
    throw e;
  }
};
