import { api } from './api.ts';

export type AnalyticsEvent = {
  event: string;
  props?: Record<string, any>;
  ts?: string;
};

export async function track(event: string, props?: Record<string, any>) {
  const payload: AnalyticsEvent = { event, props, ts: new Date().toISOString() };
  try {
    await api.post('/analytics', payload);
  } catch (e) {
    // Best-effort; ignore failures
    if (import.meta.env.DEV) {
      console.debug('[analytics] failed', payload);
    }
  }
}
