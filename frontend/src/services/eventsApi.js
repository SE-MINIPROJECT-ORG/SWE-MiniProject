import { apiRequest } from './apiClient.js';

export const eventsApi = {
  search: (filters) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== undefined && value !== null) params.set(key, value);
    }
    return apiRequest(`/api/events?${params.toString()}`);
  },
  get: (id, token) => apiRequest(`/api/events/${id}`, { token }),
  mine: (token) => apiRequest('/api/events/mine', { token }),
  create: (event, token) => apiRequest('/api/events', { method: 'POST', body: event, token }),
  publish: (id, token) => apiRequest(`/api/events/${id}/publish`, { method: 'POST', token }),
  update: (id, event, token) => apiRequest(`/api/events/${id}`, { method: 'PUT', body: event, token }),
  cancel: (id, token) => apiRequest(`/api/events/${id}/cancel`, { method: 'POST', token }),
  categories: () => apiRequest('/api/categories'),
  createCategory: (name, token) => apiRequest('/api/categories', { method: 'POST', body: { name }, token }),
  renameCategory: (id, name, token) => apiRequest(`/api/categories/${id}`, { method: 'PUT', body: { name }, token }),
  deleteCategory: (id, token) => apiRequest(`/api/categories/${id}`, { method: 'DELETE', token }),
};
