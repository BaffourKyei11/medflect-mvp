import { api } from './api.ts';

export const getConsent = async (patientId: string) => {
  const { data } = await api.get(`/consent/${patientId}`);
  return data;
};

export const upsertConsent = async (payload: any) => {
  const { data } = await api.post('/consent', payload);
  return data;
};
