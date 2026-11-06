// Short labels for notification types shown in the in-app list (EVT-F-034).
const LABELS = {
  REGISTRATION_CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlist',
  PROMOTED: 'Promoted',
  REGISTRATION_CANCELLED: 'Cancelled',
  EVENT_CANCELLED: 'Event cancelled',
  REMINDER: 'Reminder',
};

export function notificationLabel(type) {
  return LABELS[type] || 'Update';
}

export function unreadText(count) {
  if (!count) return 'Notifications';
  return `Notifications (${count > 99 ? '99+' : count})`;
}
