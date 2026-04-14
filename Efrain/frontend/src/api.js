const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  dashboard: () => request('/dashboard'),
  units: (state) => request(`/units${state ? `?state=${state}` : ''}`),
  unit: (id) => request(`/units/${id}`),
  createUnits: (count, prefix) =>
    request('/units', {
      method: 'POST',
      body: JSON.stringify({ count, prefix }),
    }),
  transition: (id, to_state) =>
    request(`/units/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ to_state }),
    }),
  bulkTransition: (unit_ids, to_state) =>
    request('/units/bulk-transition', {
      method: 'POST',
      body: JSON.stringify({ unit_ids, to_state }),
    }),
  reset: () => request('/reset', { method: 'POST' }),
};
