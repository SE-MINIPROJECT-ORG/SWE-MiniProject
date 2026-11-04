// Helpers for event pages (F2).

export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// <input type="datetime-local"> gives local time without a zone; the API wants ISO with a zone.
export function localInputToIso(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

// Same rules as the backend (EVT-F-011), checked before the form is sent.
export function validateEventForm(form, now = new Date()) {
  const errors = {};
  const start = form.startTime ? new Date(form.startTime) : null;
  const end = form.endTime ? new Date(form.endTime) : null;
  const capacity = Number(form.capacity);

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.venue.trim()) errors.venue = 'Venue is required';
  if (!form.categoryId) errors.categoryId = 'Choose a category';
  if (!start) errors.startTime = 'Start date and time is required';
  else if (start <= now) errors.startTime = 'Start must be in the future';
  if (!end) errors.endTime = 'End date and time is required';
  else if (start && end <= start) errors.endTime = 'End must be after the start';
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
    errors.capacity = 'Capacity must be a whole number from 1 to 10000';
  }
  return errors;
}

export function seatsText(event) {
  return event.seatsLeft > 0 ? `${event.seatsLeft} of ${event.capacity} seats left` : 'Full (waitlist open)';
}
