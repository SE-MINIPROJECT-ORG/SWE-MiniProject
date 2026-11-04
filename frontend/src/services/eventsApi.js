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
  categories: () => apiRequest('/api/categories'),
};
