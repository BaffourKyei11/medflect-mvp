import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';
import { getToken, onLogout } from './session.ts';
import { enqueue, flush, scheduleFlush } from './queue.ts';

const configuredBase = (import.meta as any).env.VITE_API_BASE as string | undefined;
// Resolve API base:
// - If VITE_API_BASE is set, use it.
// - If running in browser during Vite dev, use local API at http://localhost:3001
// - Otherwise (prod), use same-origin.
const isBrowser = typeof window !== 'undefined';
const isDev = (import.meta as any).env?.DEV === true;
const resolvedBase = configuredBase && configuredBase.trim() !== ''
  ? configuredBase
  : (isBrowser && isDev)
    ? 'http://localhost:3001'
    : '';

export const api = axios.create({ baseURL: `${resolvedBase}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const t = getToken();
  // Do not send Authorization for public AI endpoints
  const url = (config.url || '').toString();
  const isPublicAI = url.includes('/ai/');
  if (t && !isPublicAI) {
    if (!config.headers) config.headers = new AxiosHeaders();
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

    // Auth handling - avoid logging out for public AI endpoints
    if (error?.response?.status === 401) {
      const eurl = (cfg?.url || '').toString();
      const isAI = eurl.includes('/ai/');
      if (!isAI) onLogout();
    }

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
