// Event report (EVT-F-035), attendee CSV (EVT-F-036) and admin dashboard (EVT-F-037).
const AppError = require('../../utils/AppError');
const repository = require('./reports.repository');

async function ownEvent(eventId, user) {
  const event = await repository.findEvent(eventId);
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  if (user.role !== 'ADMIN' && event.organizer_id !== user.id) {
    throw new AppError(403, 'FORBIDDEN', 'You can only see reports for your own events');
  }
  return event;
}

// "Confirmed" counts everyone who holds a seat, including those already checked in,
// so 10 confirmed with 8 checked in gives an 80% attendance rate (AC-EVT-F-035).
function buildReport(counts) {
  const checkedIn = counts.CHECKED_IN || 0;
  const confirmed = (counts.CONFIRMED || 0) + checkedIn;
  return {
    confirmed,
    checkedIn,
    waitlisted: counts.WAITLISTED || 0,
    cancelled: counts.CANCELLED || 0,
    attendanceRate: confirmed ? Math.round((checkedIn / confirmed) * 1000) / 10 : 0,
  };
}

async function getReport(eventId, user) {
  const event = await ownEvent(eventId, user);
  const report = buildReport(await repository.countByStatus(eventId));
  return { event: { id: event.id, title: event.title, startTime: event.start_time, capacity: event.capacity, status: event.status }, ...report };
}

// One CSV cell. Quotes are doubled, and a cell that starts with = + - or @ gets a leading
// apostrophe so a spreadsheet never runs it as a formula (CSV injection).
function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  const lines = [['Name', 'Email', 'Status', 'Checked in at']];
  for (const row of rows) {
    lines.push([row.name, row.email, row.status, row.checked_in_at ? new Date(row.checked_in_at).toISOString() : '']);
  }
  // The byte order mark makes Excel open the file as UTF-8.
  return `\uFEFF${lines.map((cells) => cells.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

async function attendeesCsv(eventId, user) {
  const event = await ownEvent(eventId, user);
  return { filename: `attendees-event-${event.id}.csv`, csv: toCsv(await repository.attendees(eventId)) };
}

async function dashboard() {
  const totals = await repository.dashboardTotals();
  const pick = (source, keys) => Object.fromEntries(keys.map((k) => [k, source[k] || 0]));
  const sum = (source) => Object.values(source).reduce((a, b) => a + b, 0);
  const users = pick(totals.users, ['ATTENDEE', 'ORGANIZER', 'ADMIN']);
  const events = pick(totals.events, ['DRAFT', 'PUBLISHED', 'CANCELLED']);
  const registrations = pick(totals.registrations, ['CONFIRMED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN']);
  return {
    users: { ...users, total: sum(users) },
    events: { ...events, total: sum(events) },
    registrations: { ...registrations, total: sum(registrations) },
  };
}

module.exports = { getReport, attendeesCsv, dashboard, buildReport, csvCell, toCsv };
