import { apiRequest } from './apiClient.js';

export const registrationsApi = {
  register: (eventId, token) => apiRequest(`/api/events/${eventId}/registrations`, { method: 'POST', token }),
  mine: (token) => apiRequest('/api/registrations/me', { token }),
  cancel: (id, token) => apiRequest(`/api/registrations/${id}/cancel`, { method: 'POST', token }),
};
