import * as SecureStore from 'expo-secure-store';

export interface BaseFhirResource { resourceType: string; id?: string }
export type FhirResource<T = any> = T & BaseFhirResource;

// Prefer Expo public env at build time, fallback to runtime env (Hermes/JSI) or default localhost
const API_BASE =
  (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_BASE) ||
  (typeof process !== 'undefined' && (process as any).env?.API_BASE) ||
  'http://localhost:3001/api';

async function getToken(): Promise<string | null> {
  try {
    // Align with web key used in localStorage: 'medflect.token'
    return (await SecureStore.getItemAsync('medflect.token')) || null;
  } catch {
    return null;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as any),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    // React Native fetch does not use browser cookies; rely on Bearer token
  });

  const text = await res.text();
  if (!res.ok) {
    // Try to parse JSON error, otherwise return text
    let detail: string = text;
    try {
      const obj = JSON.parse(text);
      detail = obj?.message || obj?.error || text;
    } catch {}
    throw new Error(`API ${res.status}: ${detail}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // In case of empty body
    return undefined as unknown as T;
  }
}

export const Fhir = {
  getPatient: (id: string) => api(`/fhir/Patient/${id}`),
  searchEncounters: (patientId: string, page = 1) => api(`/fhir/Encounter?patient=${patientId}&_page=${page}`),
  searchObservations: (patientId: string, page = 1) => api(`/fhir/Observation?subject=${patientId}&_page=${page}`),
  create: <T extends BaseFhirResource>(resource: T) => api(`/fhir/${resource.resourceType}`, { method: 'POST', body: JSON.stringify(resource) }),
  update: <T extends BaseFhirResource>(resource: T) => api(`/fhir/${resource.resourceType}/${resource.id}`, { method: 'PUT', body: JSON.stringify(resource) }),
};
