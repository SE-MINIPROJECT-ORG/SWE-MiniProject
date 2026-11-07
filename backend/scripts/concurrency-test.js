// EVT-NF-004: sends many registration requests for one event at the same moment
// and checks that confirmed registrations never exceed the capacity.
//
// Run against a running backend whose rate limit has been raised, for example:
//   docker compose exec backend node scripts/concurrency-test.js
// Settings (environment variables): API_URL, ATTEMPTS (default 500), CAPACITY (default 50).
// It creates throwaway test users and one event, and deletes them again at the end.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../src/config/db');
const config = require('../src/config/env');

const API_URL = process.env.API_URL || `http://localhost:${config.port}`;
const ATTEMPTS = parseInt(process.env.ATTEMPTS || '500', 10);
const CAPACITY = parseInt(process.env.CAPACITY || '50', 10);
const RUN_ID = crypto.randomBytes(3).toString('hex');

const tokenFor = (id, role) => jwt.sign({ role }, config.jwtSecret, { subject: String(id), jwtid: crypto.randomUUID(), expiresIn: 600 });

async function api(method, path, token) {
  const res = await fetch(`${API_URL}${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
  return res.status;
}

async function main() {
  const client = await pool.connect();
  let eventId;
  try {
    // One organizer and ATTEMPTS attendees, created directly in the database.
    const organizer = await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, 'x', 'ORGANIZER') RETURNING id",
      [`Load organizer ${RUN_ID}`, `load-org-${RUN_ID}@ems.test`]
    );
    const attendees = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       SELECT 'Load attendee ' || n, 'load-' || $1 || '-' || n || '@ems.test', 'x', 'ATTENDEE'
       FROM generate_series(1, $2) AS n RETURNING id`,
      [RUN_ID, ATTEMPTS]
    );
    const category = await client.query('SELECT id FROM categories ORDER BY id LIMIT 1');
    const event = await client.query(
      `INSERT INTO events (organizer_id, category_id, title, venue, start_time, end_time, capacity, status)
       VALUES ($1, $2, $3, 'Load test', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', $4, 'PUBLISHED')
       RETURNING id`,
      [organizer.rows[0].id, category.rows[0].id, `Concurrency test ${RUN_ID}`, CAPACITY]
    );
    eventId = event.rows[0].id;

    console.log(`Sending ${ATTEMPTS} registration requests at once for an event with ${CAPACITY} seats...`);
    const started = Date.now();
    const statuses = await Promise.all(
      attendees.rows.map((a) => api('POST', `/api/events/${eventId}/registrations`, tokenFor(a.id, 'ATTENDEE')))
    );
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    const counts = await client.query(
      'SELECT status, COUNT(*)::int AS n FROM registrations WHERE event_id = $1 GROUP BY status',
      [eventId]
    );
    const byStatus = Object.fromEntries(counts.rows.map((r) => [r.status, r.n]));
    const confirmed = byStatus.CONFIRMED || 0;
    const waitlisted = byStatus.WAITLISTED || 0;
    const created = statuses.filter((s) => s === 201).length;
    const limited = statuses.filter((s) => s === 429).length;

    console.log(`Finished in ${seconds} s. HTTP 201: ${created}, HTTP 429: ${limited}, other: ${ATTEMPTS - created - limited}`);
    console.log(`Confirmed: ${confirmed} (capacity ${CAPACITY}), waitlisted: ${waitlisted}`);
    if (limited > 0) {
      console.log('Some requests hit the rate limit. Restart the backend with API_RATE_LIMIT=100000 and run again.');
      process.exitCode = 1;
    } else if (confirmed > CAPACITY) {
      console.log('FAIL: the event is overbooked.');
      process.exitCode = 1;
    } else if (confirmed + waitlisted !== ATTEMPTS) {
      console.log('FAIL: some registrations are missing.');
      process.exitCode = 1;
    } else {
      console.log('PASS: no overbooking (EVT-NF-004).');
    }
  } finally {
    // Emails and in-app notifications are sent in the background, so give them
    // a few seconds to finish, then remove everything this run created.
    await new Promise((resolve) => setTimeout(resolve, 5000));
    if (eventId) {
      await client.query('DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', [`load-%${RUN_ID}%`]);
      await client.query('DELETE FROM registrations WHERE event_id = $1', [eventId]);
      await client.query('DELETE FROM events WHERE id = $1', [eventId]);
    }
    await client.query('DELETE FROM users WHERE email LIKE $1', [`load-%${RUN_ID}%`]);
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`Concurrency test failed: ${err.message}`);
  process.exitCode = 1;
});
