import { apiRequest } from './apiClient.js';

export const authApi = {
  register: (details) => apiRequest('/api/auth/register', { method: 'POST', body: details }),
  login: (email, password) => apiRequest('/api/auth/login', { method: 'POST', body: { email, password } }),
  logout: (token) => apiRequest('/api/auth/logout', { method: 'POST', token }),
};
