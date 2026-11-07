import { apiRequest } from './apiClient.js';

export const notificationsApi = {
  mine: (token) => apiRequest('/api/notifications', { token }),
  markRead: (id, token) => apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH', token }),
};
