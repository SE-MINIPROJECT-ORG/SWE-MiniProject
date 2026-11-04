// Business rules for registering and cancelling (F3, Sprint 1).
const crypto = require('crypto');
const { pool } = require('../../config/db');
const AppError = require('../../utils/AppError');
const { notify, TYPES } = require('../notifications/notification.service');
const repository = require('./registrations.repository');

function newTicketId() {
  return `TKT-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

// Runs work(client) in one transaction. Any error rolls everything back.
async function inTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function toApi(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    status: row.status,
    ticketId: row.ticket_id,
    queuePosition: row.queue_position,
    createdAt: row.created_at,
  };
}

// EVT-F-020 (confirmed seat), EVT-F-021 (no duplicates), EVT-F-022 (waitlist when full).
async function register(eventId, userId) {
  let event;
  let user;
  let registration;
  try {
    registration = await inTransaction(async (client) => {
      event = await repository.lockEvent(client, eventId);
      if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
      if (event.status !== 'PUBLISHED' || new Date(event.start_time) <= new Date()) {
        throw new AppError(400, 'EVENT_NOT_OPEN', 'This event is not open for registration');
      }
      if (await repository.findActive(client, eventId, userId)) {
        throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this event');
      }

      user = await repository.findUser(client, userId);
      const taken = await repository.countSeatsTaken(client, eventId);
      const hasSeat = taken < event.capacity;

      return repository.insert(client, {
        eventId,
        userId,
        status: hasSeat ? 'CONFIRMED' : 'WAITLISTED',
        ticketId: newTicketId(),
        queuePosition: hasSeat ? null : await repository.nextQueuePosition(client, eventId),
      });
    });
  } catch (err) {
    // The unique index caught a duplicate that slipped past the check above.
    if (err.code === '23505') {
      throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this event');
    }
    throw err;
  }

  // Email goes out in the background after the commit (EVT-F-032).
  const type = registration.status === 'CONFIRMED' ? TYPES.REGISTRATION_CONFIRMED : TYPES.WAITLISTED;
  notify(type, user, event, registration);
  return toApi(registration);
}

// EVT-F-023 (cancel before the start), EVT-SR-005 (only your own registration).
async function cancel(registrationId, userId) {
  let event;
  let user;
  const registration = await inTransaction(async (client) => {
    const found = await repository.findById(client, registrationId);
    if (!found) throw new AppError(404, 'NOT_FOUND', 'Registration not found');
    if (found.user_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own registrations');
    }

    // Same lock order as register (event first), so the two can never deadlock.
    event = await repository.lockEvent(client, found.event_id);
    const current = await repository.lockById(client, registrationId);
    if (!['CONFIRMED', 'WAITLISTED'].includes(current.status)) {
      throw new AppError(409, 'INVALID_STATE', `A ${current.status.toLowerCase()} registration cannot be cancelled`);
    }
    if (new Date(event.start_time) <= new Date()) {
      throw new AppError(400, 'EVENT_NOT_OPEN', 'Registrations cannot be cancelled after the event has started');
    }

    user = await repository.findUser(client, userId);
    return repository.markCancelled(client, registrationId);
  });

  notify(TYPES.REGISTRATION_CANCELLED, user, event, registration);
  return toApi(registration);
}

// EVT-F-025: only the logged-in attendee's registrations.
async function listMine(userId) {
  const rows = await repository.listForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    ticketId: row.ticket_id,
    queuePosition: row.queue_position,
    createdAt: row.created_at,
    event: {
      id: row.event_id,
      title: row.title,
      venue: row.venue,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.event_status,
    },
  }));
}

module.exports = { register, cancel, listMine };
