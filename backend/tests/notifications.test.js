const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockSend = jest.fn();
jest.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: mockSend }) }));
jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/notifications/notifications.repository');

const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/notifications/notifications.repository');
const { sendMail } = require('../src/modules/notifications/mailer');
const { notify, buildEmail, sendDueReminders, TYPES } = require('../src/modules/notifications/notification.service');
const { runReminderJob } = require('../src/modules/notifications/scheduler');
const app = require('../src/app');

const event = { title: 'Tech Talk', start_time: '2026-12-01T10:00:00Z', venue: 'Hall A' };
const token = (id) =>
  `Bearer ${jwt.sign({ role: 'ATTENDEE' }, process.env.JWT_SECRET, { subject: String(id), jwtid: `n-${id}`, expiresIn: 3600 })}`;

beforeEach(() => {
  jest.resetAllMocks();
  mockSend.mockResolvedValue({});
  authRepository.isTokenRevoked.mockResolvedValue(false);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('mailer', () => {
  it('sends an email and returns true', async () => {
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: 'Body' })).resolves.toBe(true);
    expect(mockSend.mock.calls[0][0]).toMatchObject({ to: 'a@ems.test', subject: 'Hi' });
  });

  it('retries a failed email and succeeds on a later attempt', async () => {
    mockSend.mockReset().mockRejectedValueOnce(new Error('smtp down')).mockResolvedValueOnce({});
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: '' }, { retryDelayMs: 0 })).resolves.toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('gives up after 3 attempts without throwing', async () => {
    mockSend.mockReset().mockRejectedValue(new Error('smtp down'));
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: '' }, { retryDelayMs: 0 })).resolves.toBe(false);
    expect(mockSend).toHaveBeenCalledTimes(3);
  });
});

describe('notification emails (EVT-F-032, EVT-F-033)', () => {
  it('includes the ticket ID in the confirmation email', () => {
    const email = buildEmail(TYPES.REGISTRATION_CONFIRMED, event, { ticket_id: 'TKT-ABC' });
    expect(email.subject).toBe('Registration confirmed: Tech Talk');
    expect(email.text).toContain('TKT-ABC');
  });

  it('includes the waitlist position in the waitlist email', () => {
    expect(buildEmail(TYPES.WAITLISTED, event, { queue_position: 3 }).text).toContain('position 3');
  });

  it.each([TYPES.PROMOTED, TYPES.REGISTRATION_CANCELLED, TYPES.EVENT_CANCELLED, TYPES.REMINDER])('builds the %s email', (type) => {
    expect(buildEmail(type, event, { ticket_id: 'TKT-1' }).subject).toContain('Tech Talk');
  });

  it('rejects an unknown notification type', () => {
    expect(() => buildEmail('NOPE', event)).toThrow('Unknown notification type');
  });
});

describe('notify (EVT-F-034)', () => {
  it('saves an in-app notification and sends the email', async () => {
    await notify(TYPES.REGISTRATION_CANCELLED, { id: 4, email: 'attendee1@ems.test' }, event);
    expect(repository.insert).toHaveBeenCalledWith(4, 'REGISTRATION_CANCELLED', 'Registration cancelled: Tech Talk');
    expect(mockSend.mock.calls[0][0].to).toBe('attendee1@ems.test');
  });

  it('still sends the email when saving the in-app notification fails', async () => {
    repository.insert.mockRejectedValue(new Error('db down'));
    await expect(notify(TYPES.PROMOTED, { id: 4, email: 'a@ems.test' }, event, { ticket_id: 'T' })).resolves.toBe(true);
    expect(mockSend).toHaveBeenCalled();
  });
});

describe('reminders (EVT-F-033)', () => {
  it('sends one reminder per due registration', async () => {
    repository.claimDueReminders.mockResolvedValue([
      { user_id: 1, email: 'a1@ems.test', ticket_id: 'T1', ...event },
      { user_id: 2, email: 'a2@ems.test', ticket_id: 'T2', ...event },
    ]);
    await expect(sendDueReminders()).resolves.toBe(2);
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend.mock.calls[0][0].subject).toBe('Reminder: Tech Talk starts within 24 hours');
  });

  it('the scheduled job never throws', async () => {
    repository.claimDueReminders.mockRejectedValue(new Error('db down'));
    await expect(runReminderJob()).resolves.toBeUndefined();
  });
});

describe('notification API (EVT-F-034)', () => {
  it('lists the user’s notifications with the unread count', async () => {
    repository.listForUser.mockResolvedValue([{ id: 1, type: 'PROMOTED', message: 'Hi', read: false, created_at: 'x' }]);
    repository.countUnread.mockResolvedValue(1);
    const res = await request(app).get('/api/notifications').set('Authorization', token(4));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ unread: 1, items: [{ id: 1, read: false }] });
    expect(repository.listForUser).toHaveBeenCalledWith(4);
  });

  it('marks the user’s own notification as read', async () => {
    repository.findById.mockResolvedValue({ id: 9, user_id: 4, read: false });
    const res = await request(app).patch('/api/notifications/9/read').set('Authorization', token(4));
    expect(res.status).toBe(200);
    expect(repository.markRead).toHaveBeenCalledWith(9);
  });

  it('refuses to mark another user’s notification with 403', async () => {
    repository.findById.mockResolvedValue({ id: 9, user_id: 5, read: false });
    const res = await request(app).patch('/api/notifications/9/read').set('Authorization', token(4));
    expect(res.status).toBe(403);
    expect(repository.markRead).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown notification', async () => {
    repository.findById.mockResolvedValue(null);
    expect((await request(app).patch('/api/notifications/99/read').set('Authorization', token(4))).status).toBe(404);
  });

  it('requires login', async () => {
    expect((await request(app).get('/api/notifications')).status).toBe(401);
  });
});
