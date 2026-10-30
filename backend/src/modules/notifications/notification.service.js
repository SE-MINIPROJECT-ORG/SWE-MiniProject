// Builds and sends the registration status emails (EVT-F-032).
// notify() does not need to be awaited: emails go out in the background.
const { sendMail } = require('./mailer');

const TYPES = {
  REGISTRATION_CONFIRMED: 'REGISTRATION_CONFIRMED',
  WAITLISTED: 'WAITLISTED',
  PROMOTED: 'PROMOTED',
  REGISTRATION_CANCELLED: 'REGISTRATION_CANCELLED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
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
};

function buildEmail(type, event, registration = {}) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown notification type: ${type}`);
  }
  return template(event, registration);
}

// user: { email }, event: { title, start_time, venue }, registration: { ticket_id, queue_position }
function notify(type, user, event, registration = {}) {
  const { subject, text } = buildEmail(type, event, registration);
  return sendMail({ to: user.email, subject, text });
}

module.exports = { notify, buildEmail, TYPES };
