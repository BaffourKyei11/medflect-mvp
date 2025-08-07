import { api } from './api.ts';

export const getSyncStatus = async () => {
  const { data } = await api.get('/sync/status');
  return data as { lastPush?: string; lastPull?: string; queued?: number };
};
export const triggerSync = async () => {
  const { data } = await api.post('/sync/trigger', {});
  return data;
};
