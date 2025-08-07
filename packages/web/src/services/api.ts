import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, onLogout } from './session.ts';
import { enqueue, flush, scheduleFlush } from './queue.ts';

const configuredBase = (import.meta as any).env.VITE_API_BASE as string | undefined;
// Default to same-origin in browser (Vercel serverless functions), fallback to localhost for SSR/dev tooling
const resolvedBase = configuredBase && configuredBase.trim() !== ''
  ? configuredBase
  : (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

export const api = axios.create({ baseURL: `${resolvedBase}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    if (!config.headers) config.headers = {};
    // set Authorization header while preserving AxiosHeaders type
    (config.headers as any)['Authorization'] = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const cfg = error.config as AxiosRequestConfig & { __queued?: boolean };
    const method = (cfg?.method || 'get').toLowerCase();
    const isWrite = ['post','put','patch','delete'].includes(method);
    const networkIssue = !navigator.onLine || error.code === 'ERR_NETWORK';

    // Auth handling
    if (error?.response?.status === 401) onLogout();

    // Offline-first queue for writes
    if (isWrite && networkIssue && !cfg?.__queued) {
      await enqueue({ url: cfg.url || '', method, data: cfg.data, headers: (cfg.headers as any) || {} });
      // schedule a background flush with backoff
      scheduleFlush(() => flush((c) => api.request({ ...c, __queued: true } as any)));
      // return synthetic accepted response to allow optimistic UI
      const synthetic: AxiosResponse = {
        data: { queued: true },
        status: 202,
        statusText: 'Accepted (queued)',
        headers: {},
        config: cfg
      } as any;
      return Promise.resolve(synthetic);
    }

    return Promise.reject(error);
  }
);

// Auto-flush queued requests when online
if (typeof window !== 'undefined'){
  window.addEventListener('online', () => {
    flush((cfg) => api.request({ ...cfg, __queued: true } as any)).catch(() => {
      scheduleFlush(() => flush((c) => api.request({ ...c, __queued: true } as any)));
    });
  });
}
