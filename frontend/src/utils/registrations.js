// Helpers for registration pages (F3). Status is shown with text and colour (SAD 4.5.1).

const LABELS = {
  CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked in',
};

export function statusLabel(registration) {
  const label = LABELS[registration.status] || registration.status;
  return registration.status === 'WAITLISTED' && registration.queuePosition
    ? `${label} (position ${registration.queuePosition})`
    : label;
}

// Active registrations can be cancelled until the event starts (EVT-F-023).
export function canCancel(registration, now = new Date()) {
  return (
    ['CONFIRMED', 'WAITLISTED'].includes(registration.status) && new Date(registration.event.startTime) > now
  );
}

export function registerResultMessage(registration) {
  return registration.status === 'CONFIRMED'
    ? `You are registered. Your ticket ID is ${registration.ticketId}.`
    : `The event is full. You are on the waitlist at position ${registration.queuePosition}.`;
}

// A ticket page exists only for confirmed (or already checked-in) registrations (EVT-F-026).
export function hasTicket(registration) {
  return ['CONFIRMED', 'CHECKED_IN'].includes(registration.status);
}

// Counts for the organizer's registration list (EVT-F-027).
export function countByStatus(registrations) {
  const counts = { CONFIRMED: 0, WAITLISTED: 0, CANCELLED: 0, CHECKED_IN: 0 };
  for (const r of registrations) {
    if (r.status in counts) counts[r.status] += 1;
  }
  return counts;
}
