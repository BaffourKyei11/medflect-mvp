import useAuth from '../packages/web/components/useAuth';

const API_BASE = '/fhir';

async function handleResponse(res, logout) {
  if (res.status === 401 || res.status === 403) {
    logout && logout();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getResource(type, query = '', logout) {
  const res = await fetch(`${API_BASE}/${type}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
  });
  return handleResponse(res, logout);
}

export async function createResource(type, data, logout) {
  const res = await fetch(`${API_BASE}/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('jwt')}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res, logout);
}

export async function updateResource(type, id, data, logout) {
  const res = await fetch(`${API_BASE}/${type}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('jwt')}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res, logout);
}
