import { apiRequest } from './apiClient.js';

export const checkinApi = {
  checkIn: (eventId, ticketId, token) =>
    apiRequest(`/api/events/${eventId}/checkins`, { method: 'POST', body: { ticketId }, token }),
};
