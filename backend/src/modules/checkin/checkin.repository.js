// Database access for check-in (EVT-F-030, EVT-F-031). Runs inside a transaction.

async function findEvent(client, eventId) {
  const { rows } = await client.query('SELECT id, organizer_id, status, title FROM events WHERE id = $1', [eventId]);
  return rows[0] || null;
}

// Locks the registration so the same ticket cannot be checked in twice at once.
async function lockByTicket(client, ticketId) {
  const { rows } = await client.query(
    `SELECT r.id, r.event_id, r.status, r.checked_in_at, u.name AS attendee_name
       FROM registrations r JOIN users u ON u.id = r.user_id
      WHERE r.ticket_id = $1
      FOR UPDATE OF r`,
    [ticketId]
  );
  return rows[0] || null;
}

async function markCheckedIn(client, registrationId) {
  const { rows } = await client.query(
    "UPDATE registrations SET status = 'CHECKED_IN', checked_in_at = NOW() WHERE id = $1 RETURNING checked_in_at",
    [registrationId]
  );
  return rows[0].checked_in_at;
}

module.exports = { findEvent, lockByTicket, markCheckedIn };
