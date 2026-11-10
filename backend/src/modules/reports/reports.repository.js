// Read-only queries for reports, CSV export and the admin dashboard (EVT-F-035 to EVT-F-037).
const db = require('../../config/db');

async function findEvent(id) {
  const { rows } = await db.query('SELECT id, organizer_id, title, start_time, capacity, status FROM events WHERE id = $1', [id]);
  return rows[0] || null;
}

async function countByStatus(eventId) {
  const { rows } = await db.query(
    'SELECT status, COUNT(*)::int AS n FROM registrations WHERE event_id = $1 GROUP BY status',
    [eventId]
  );
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

async function attendees(eventId) {
  const { rows } = await db.query(
    `SELECT u.name, u.email, r.status, r.checked_in_at
       FROM registrations r JOIN users u ON u.id = r.user_id
      WHERE r.event_id = $1
      ORDER BY u.name, r.id`,
    [eventId]
  );
  return rows;
}

async function dashboardTotals() {
  const [users, events, registrations] = await Promise.all([
    db.query('SELECT role AS key, COUNT(*)::int AS n FROM users GROUP BY role'),
    db.query('SELECT status AS key, COUNT(*)::int AS n FROM events GROUP BY status'),
    db.query('SELECT status AS key, COUNT(*)::int AS n FROM registrations GROUP BY status'),
  ]);
  const toObject = (result) => Object.fromEntries(result.rows.map((r) => [r.key, r.n]));
  return { users: toObject(users), events: toObject(events), registrations: toObject(registrations) };
}

module.exports = { findEvent, countByStatus, attendees, dashboardTotals };
