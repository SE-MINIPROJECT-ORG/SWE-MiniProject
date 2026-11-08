// Business rules for registering, cancelling, waitlist promotion and tickets (F3).
const crypto = require('crypto');
const QRCode = require('qrcode');
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

// Fills free seats from the waitlist, first in first out (EVT-F-024).
// Must run inside the transaction that holds the event lock.
// Also used by the event module when an organizer raises the capacity.
async function promoteFromWaitlist(client, event) {
  const taken = await repository.countSeatsTaken(client, event.id);
  const freeSeats = event.capacity - taken;
  const promoted = [];
  if (freeSeats > 0) {
    for (const waiting of await repository.firstWaitlisted(client, event.id, freeSeats)) {
      const row = await repository.promote(client, waiting.id);
      promoted.push({ registration: row, user: { id: waiting.user_id, name: waiting.user_name, email: waiting.user_email } });
    }
  }
  await repository.renumberWaitlist(client, event.id);
  return promoted;
}

// Emails and in-app notifications for promoted attendees, sent after the commit.
function notifyPromoted(promoted, event) {
  for (const { registration, user } of promoted) {
    notify(TYPES.PROMOTED, user, event, registration);
  }
}

// EVT-F-023 (cancel before the start), EVT-F-024 (promote the first waitlisted),
// EVT-SR-005 (only your own registration).
async function cancel(registrationId, userId) {
  let event;
  let user;
  let promoted = [];
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
    const cancelled = await repository.markCancelled(client, registrationId);
    promoted = await promoteFromWaitlist(client, event);
    return cancelled;
  });

  notify(TYPES.REGISTRATION_CANCELLED, user, event, registration);
  notifyPromoted(promoted, event);
  return { ...toApi(registration), promotedRegistrationId: promoted.length ? promoted[0].registration.id : null };
}

// EVT-F-026: ticket page with a QR code that encodes the ticket ID. Only the owner can see it.
async function getTicket(registrationId, userId) {
  const ticket = await repository.findTicket(registrationId);
  if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Registration not found');
  if (ticket.user_id !== userId) throw new AppError(403, 'FORBIDDEN', 'You can only view your own tickets');
  if (!['CONFIRMED', 'CHECKED_IN'].includes(ticket.status)) {
    throw new AppError(409, 'INVALID_STATE', 'A ticket is only available for a confirmed registration');
  }
  return {
    registrationId: ticket.id,
    ticketId: ticket.ticket_id,
    status: ticket.status,
    attendeeName: ticket.user_name,
    checkedInAt: ticket.checked_in_at,
    event: {
      id: ticket.event_id,
      title: ticket.title,
      venue: ticket.venue,
      startTime: ticket.start_time,
      endTime: ticket.end_time,
      status: ticket.event_status,
    },
    qrCode: await QRCode.toDataURL(ticket.ticket_id, { margin: 1, width: 240 }),
  };
}

// EVT-F-027 and EVT-SR-005: only the organizer of the event (or an admin) sees its registrations.
async function listForEvent(eventId, user) {
  const event = await repository.findEvent(eventId);
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  if (user.role !== 'ADMIN' && event.organizer_id !== user.id) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view registrations for your own events');
  }
  const rows = await repository.listForEvent(eventId);
  return {
    event: { id: event.id, title: event.title },
    registrations: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      ticketId: row.status === 'WAITLISTED' ? null : row.ticket_id,
      queuePosition: row.queue_position,
      registeredAt: row.created_at,
      checkedInAt: row.checked_in_at,
    })),
  };
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

module.exports = { register, cancel, listMine, getTicket, listForEvent, promoteFromWaitlist, notifyPromoted, inTransaction };
