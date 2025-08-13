import { api } from './api.ts';

export const getDashboard = async () => {
  const { data } = await api.get('/dashboard');
  return data as { kpis: Array<{ label: string; value: number }>; alerts?: string[] };
};
