import { api } from './api.ts';

export const getFHIR = async (path: string, params?: any) => {
  const { data } = await api.get(`/fhir${path.startsWith('/') ? '' : '/'}${path}`, { params });
  return data;
};

export const saveNote = async (patientId: string, note: string) => {
  const { data } = await api.post(`/patients/${patientId}/notes`, { note });
  return data;
};
