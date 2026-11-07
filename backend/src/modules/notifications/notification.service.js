// Sends notifications by email (EVT-F-032, EVT-F-033) and records each one
// in the user's in-app notification list (EVT-F-034).
// notify() never throws and does not need to be awaited: it runs in the background.
const { sendMail } = require('./mailer');
const repository = require('./notifications.repository');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const TYPES = {
  REGISTRATION_CONFIRMED: 'REGISTRATION_CONFIRMED',
  WAITLISTED: 'WAITLISTED',
  PROMOTED: 'PROMOTED',
  REGISTRATION_CANCELLED: 'REGISTRATION_CANCELLED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  REMINDER: 'REMINDER',
};

function formatDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function eventLines(event) {
  return `Event: ${event.title}\nWhen: ${formatDate(event.start_time)}\nWhere: ${event.venue}`;
}

const TEMPLATES = {
  REGISTRATION_CONFIRMED: (event, reg) => ({
    subject: `Registration confirmed: ${event.title}`,
    text: `Your seat is confirmed.\n\n${eventLines(event)}\nTicket ID: ${reg.ticket_id}`,
  }),
  WAITLISTED: (event, reg) => ({
    subject: `You are on the waitlist: ${event.title}`,
    text: `The event is full, so you are on the waitlist at position ${reg.queue_position}. We will email you if a seat becomes free.\n\n${eventLines(event)}`,
  }),
  PROMOTED: (event, reg) => ({
    subject: `A seat is free, you are confirmed: ${event.title}`,
    text: `A seat became free and your registration is now confirmed.\n\n${eventLines(event)}\nTicket ID: ${reg.ticket_id}`,
  }),
  REGISTRATION_CANCELLED: (event) => ({
    subject: `Registration cancelled: ${event.title}`,
    text: `Your registration has been cancelled.\n\n${eventLines(event)}`,
  }),
  EVENT_CANCELLED: (event) => ({
    subject: `Event cancelled: ${event.title}`,
    text: `The organizer has cancelled this event, so your registration is cancelled.\n\n${eventLines(event)}`,
  }),
  REMINDER: (event, reg) => ({
    subject: `Reminder: ${event.title} starts within 24 hours`,
    text: `This is a reminder that your event starts soon.\n\n${eventLines(event)}\nTicket ID: ${reg.ticket_id}`,
  }),
};

function buildEmail(type, event, registration = {}) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown notification type: ${type}`);
  }
  return template(event, registration);
}

// user: { id, email }, event: { title, start_time, venue }, registration: { ticket_id, queue_position }
async function notify(type, user, event, registration = {}) {
  const { subject, text } = buildEmail(type, event, registration);
  try {
    if (user.id) {
      await repository.insert(user.id, type, subject);
    }
  } catch (err) {
    logger.error('In-app notification could not be saved', { type, message: err.message });
  }
  return sendMail({ to: user.email, subject, text });
}

async function listMine(userId) {
  const [rows, unread] = await Promise.all([repository.listForUser(userId), repository.countUnread(userId)]);
  return {
    unread,
    items: rows.map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      read: row.read,
      createdAt: row.created_at,
    })),
  };
}

async function markRead(id, userId) {
  const notification = await repository.findById(id);
  if (!notification) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  if (notification.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only change your own notifications');
  }
  if (!notification.read) await repository.markRead(id);
  return { id, read: true };
}

// Called by the scheduler: one reminder per Confirmed attendee, 24 hours before the start.
async function sendDueReminders() {
  const due = await repository.claimDueReminders();
  await Promise.all(
    due.map((row) =>
      notify(
        TYPES.REMINDER,
        { id: row.user_id, email: row.email },
        { title: row.title, start_time: row.start_time, venue: row.venue },
        { ticket_id: row.ticket_id }
      )
    )
  );
  return due.length;
}

module.exports = { notify, buildEmail, listMine, markRead, sendDueReminders, TYPES };
