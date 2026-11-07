// Check-in by ticket ID (EVT-F-030) with a specific message for each invalid case (EVT-F-031).
const { pool } = require('../../config/db');
const AppError = require('../../utils/AppError');
const { audit, ACTIONS } = require('../../utils/auditLogger');
const repository = require('./checkin.repository');

function normaliseTicketId(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function formatTime(value) {
  return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short', dateStyle: 'medium' });
}

// Throws the right error for a ticket that cannot be checked in.
function assertCanCheckIn(registration, eventId) {
  if (!registration) {
    throw new AppError(404, 'NOT_FOUND', 'Invalid ticket: no ticket with this ID exists');
  }
  if (registration.event_id !== eventId) {
    throw new AppError(404, 'NOT_FOUND', 'This ticket belongs to a different event');
  }
  if (registration.status === 'CHECKED_IN') {
    throw new AppError(409, 'TICKET_ALREADY_USED', `Ticket already used: checked in at ${formatTime(registration.checked_in_at)}`);
  }
  if (registration.status === 'CANCELLED') {
    throw new AppError(409, 'INVALID_STATE', 'This registration was cancelled');
  }
  if (registration.status === 'WAITLISTED') {
    throw new AppError(409, 'INVALID_STATE', 'This attendee is on the waitlist and has no confirmed seat');
  }
}

async function checkIn(eventId, body, user) {
  const ticketId = normaliseTicketId(body && body.ticketId);
  if (!ticketId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Ticket ID is required', [{ field: 'ticketId', message: 'Enter a ticket ID' }]);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const event = await repository.findEvent(client, eventId);
    if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
    if (user.role !== 'ADMIN' && event.organizer_id !== user.id) {
      throw new AppError(403, 'FORBIDDEN', 'You can only check in attendees for your own events');
    }
    if (event.status !== 'PUBLISHED') {
      throw new AppError(409, 'INVALID_STATE', `Check-in is not possible for a ${event.status.toLowerCase()} event`);
    }

    const registration = await repository.lockByTicket(client, ticketId);
    assertCanCheckIn(registration, eventId);

    const checkedInAt = await repository.markCheckedIn(client, registration.id);
    await audit(user.id, ACTIONS.CHECK_IN, { eventId, ticketId }, client);
    await client.query('COMMIT');

    return { registrationId: registration.id, attendeeName: registration.attendee_name, ticketId, checkedInAt };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { checkIn, assertCanCheckIn };
