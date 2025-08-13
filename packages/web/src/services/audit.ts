import { api } from './api.ts';

export const getAudit = async (params?: { patientId?: string; limit?: number }) => {
  const { data } = await api.get('/audit', { params });
  return data;
};
