import { apiRequest } from './apiClient.js';

export const usersApi = {
  me: (token) => apiRequest('/api/users/me', { token }),
  updateMe: (profile, token) => apiRequest('/api/users/me', { method: 'PUT', body: profile, token }),
  changePassword: (currentPassword, newPassword, token) =>
    apiRequest('/api/users/me/password', { method: 'PUT', body: { currentPassword, newPassword }, token }),
  list: (token) => apiRequest('/api/users', { token }),
  changeRole: (id, role, token) => apiRequest(`/api/users/${id}/role`, { method: 'PATCH', body: { role }, token }),
  changeStatus: (id, active, token) => apiRequest(`/api/users/${id}/status`, { method: 'PATCH', body: { active }, token }),
};
