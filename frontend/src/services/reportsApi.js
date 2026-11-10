import { apiRequest } from './apiClient.js';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const reportsApi = {
  report: (eventId, token) => apiRequest(`/api/events/${eventId}/report`, { token }),
  dashboard: (token) => apiRequest('/api/admin/dashboard', { token }),

  // Downloads the attendee CSV (EVT-F-036). The token goes in the header, so the
  // file is fetched first and then saved through a temporary link.
  downloadCsv: async (eventId, token) => {
    const response = await fetch(`${BASE_URL}/api/events/${eventId}/attendees.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error((data && data.error && data.error.message) || 'Download failed');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendees-event-${eventId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
