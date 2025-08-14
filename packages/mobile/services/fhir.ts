export type FhirResource<T = any> = T & { resourceType: string; id?: string };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || process.env.API_BASE || 'http://localhost:3001/api';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const Fhir = {
  getPatient: (id: string) => api(`/fhir/Patient/${id}`),
  searchEncounters: (patientId: string, page = 1) => api(`/fhir/Encounter?patient=${patientId}&_page=${page}`),
  searchObservations: (patientId: string, page = 1) => api(`/fhir/Observation?subject=${patientId}&_page=${page}`),
  create: <T extends FhirResource>(resource: T) => api(`/fhir/${resource.resourceType}`, { method: 'POST', body: JSON.stringify(resource) }),
  update: <T extends FhirResource>(resource: T) => api(`/fhir/${resource.resourceType}/${resource.id}`, { method: 'PUT', body: JSON.stringify(resource) }),
};
