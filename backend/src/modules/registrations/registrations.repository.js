// Database access for registrations. Functions take a client so they can run
// inside one transaction (SAD 4.1.1: no overbooking).
const db = require('../../config/db');

// Locks the event row until the transaction ends. Two registrations for the
// same event therefore run one after the other, never at the same time.
async function lockEvent(client, eventId) {
  const { rows } = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [eventId]);
  return rows[0] || null;
}

async function findUser(client, userId) {
  const { rows } = await client.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  return rows[0] || null;
}

async function findActive(client, eventId, userId) {
  const { rows } = await client.query(
    "SELECT id FROM registrations WHERE event_id = $1 AND user_id = $2 AND status <> 'CANCELLED'",
    [eventId, userId]
  );
  return rows[0] || null;
}

async function countSeatsTaken(client, eventId) {
  const { rows } = await client.query(
    "SELECT COUNT(*)::int AS taken FROM registrations WHERE event_id = $1 AND status IN ('CONFIRMED', 'CHECKED_IN')",
    [eventId]
  );
  return rows[0].taken;
}

async function nextQueuePosition(client, eventId) {
  const { rows } = await client.query(
    "SELECT COALESCE(MAX(queue_position), 0) + 1 AS next FROM registrations WHERE event_id = $1 AND status = 'WAITLISTED'",
    [eventId]
  );
  return rows[0].next;
}

async function insert(client, { eventId, userId, status, ticketId, queuePosition }) {
  const { rows } = await client.query(
    `INSERT INTO registrations (event_id, user_id, status, ticket_id, queue_position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, userId, status, ticketId, queuePosition]
  );
  return rows[0];
}

async function findById(client, id) {
  const { rows } = await client.query('SELECT * FROM registrations WHERE id = $1', [id]);
  return rows[0] || null;
}

async function lockById(client, id) {
  const { rows } = await client.query('SELECT * FROM registrations WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
}

async function markCancelled(client, id) {
  const { rows } = await client.query(
    "UPDATE registrations SET status = 'CANCELLED', queue_position = NULL WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}

// First-in-first-out: lowest queue position first (EVT-F-022, EVT-F-024).
async function firstWaitlisted(client, eventId, limit) {
  const { rows } = await client.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
       FROM registrations r JOIN users u ON u.id = r.user_id
      WHERE r.event_id = $1 AND r.status = 'WAITLISTED'
      ORDER BY r.queue_position, r.id
      LIMIT $2
      FOR UPDATE OF r`,
    [eventId, limit]
  );
  return rows;
}

async function promote(client, id) {
  const { rows } = await client.query(
    "UPDATE registrations SET status = 'CONFIRMED', queue_position = NULL WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}

// Renumbers the waitlist 1, 2, 3... so everyone moves up after a promotion or cancellation.
async function renumberWaitlist(client, eventId) {
  await client.query(
    `UPDATE registrations r SET queue_position = w.position
       FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY queue_position, id) AS position
               FROM registrations WHERE event_id = $1 AND status = 'WAITLISTED') w
      WHERE r.id = w.id`,
    [eventId]
  );
}

async function findTicket(id) {
  const { rows } = await db.query(
    `SELECT r.id, r.user_id, r.status, r.ticket_id, r.checked_in_at, u.name AS user_name,
            e.id AS event_id, e.title, e.venue, e.start_time, e.end_time, e.status AS event_status
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN events e ON e.id = r.event_id
      WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findEvent(eventId) {
  const { rows } = await db.query('SELECT id, organizer_id, title FROM events WHERE id = $1', [eventId]);
  return rows[0] || null;
}

async function listForEvent(eventId) {
  const { rows } = await db.query(
    `SELECT r.id, r.status, r.ticket_id, r.queue_position, r.created_at, r.checked_in_at,
            u.name, u.email
       FROM registrations r JOIN users u ON u.id = r.user_id
      WHERE r.event_id = $1
      ORDER BY CASE r.status WHEN 'CHECKED_IN' THEN 1 WHEN 'CONFIRMED' THEN 2 WHEN 'WAITLISTED' THEN 3 ELSE 4 END,
               r.queue_position NULLS LAST, r.created_at`,
    [eventId]
  );
  return rows;
}

async function listForUser(userId) {
  const { rows } = await db.query(
    `SELECT r.id, r.status, r.ticket_id, r.queue_position, r.created_at,
            e.id AS event_id, e.title, e.venue, e.start_time, e.end_time, e.status AS event_status
     FROM registrations r
     JOIN events e ON e.id = r.event_id
     WHERE r.user_id = $1
     ORDER BY e.start_time DESC, r.id DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  lockEvent, findUser, findActive, countSeatsTaken, nextQueuePosition, insert,
  findById, lockById, markCancelled, listForUser,
  firstWaitlisted, promote, renumberWaitlist, findTicket, findEvent, listForEvent,
};
