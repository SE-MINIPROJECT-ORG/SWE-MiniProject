// Database access for in-app notifications (EVT-F-034) and reminders (EVT-F-033).
const db = require('../../config/db');

async function insert(userId, type, message) {
  await db.query('INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)', [userId, type, message]);
}

async function listForUser(userId, limit = 50) {
  const { rows } = await db.query(
    `SELECT id, type, message, read, created_at FROM notifications
     WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function countUnread(userId) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND read = FALSE', [
    userId,
  ]);
  return rows[0].unread;
}

async function findById(id) {
  const { rows } = await db.query('SELECT id, user_id, read FROM notifications WHERE id = $1', [id]);
  return rows[0] || null;
}

async function markRead(id) {
  await db.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
}

// Marks the reminder as sent and returns who to remind, in one statement.
// The reminder_sent_at check makes sure each attendee gets exactly one reminder,
// even if two scheduler runs overlap.
async function claimDueReminders() {
  const { rows } = await db.query(
    `UPDATE registrations r
        SET reminder_sent_at = NOW()
       FROM events e, users u
      WHERE e.id = r.event_id
        AND u.id = r.user_id
        AND r.status = 'CONFIRMED'
        AND r.reminder_sent_at IS NULL
        AND e.status = 'PUBLISHED'
        AND e.start_time > NOW()
        AND e.start_time <= NOW() + INTERVAL '24 hours'
     RETURNING r.id, r.ticket_id, u.id AS user_id, u.email, e.title, e.start_time, e.venue`
  );
  return rows;
}

module.exports = { insert, listForUser, countUnread, findById, markRead, claimDueReminders };
