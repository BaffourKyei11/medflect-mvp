import { api } from './api.ts';

export type Patient = { id: string; name?: string; age?: number; sex?: string };
export type Paginated<T> = { items: T[]; page: number; limit: number; total: number };

export const listPatients = async (params: { search?: string; page?: number; limit?: number } = {}) => {
  const { data } = await api.get('/patients', { params });
  return data as Paginated<Patient>;
};

export const getPatient = async (id: string) => {
  const { data } = await api.get(`/patients/${id}`);
  return data as Patient;
};
