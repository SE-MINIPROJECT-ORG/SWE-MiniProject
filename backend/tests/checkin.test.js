const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockClient = { query: jest.fn(), release: jest.fn() };
jest.mock('../src/config/db', () => ({ query: jest.fn(), pool: { connect: jest.fn() } }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/checkin/checkin.repository');
jest.mock('../src/utils/auditLogger', () => ({ audit: jest.fn(), ACTIONS: { CHECK_IN: 'CHECK_IN' } }));

const db = require('../src/config/db');
const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/checkin/checkin.repository');
const { audit } = require('../src/utils/auditLogger');
const app = require('../src/app');

const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `c-${id}`, expiresIn: 3600 })}`;
const ORGANIZER = token(5, 'ORGANIZER');
const OTHER_ORGANIZER = token(6, 'ORGANIZER');
const ATTENDEE = token(1, 'ATTENDEE');

const event = { id: 10, organizer_id: 5, status: 'PUBLISHED', title: 'Tech Talk' };
const reg = (change = {}) => ({ id: 100, event_id: 10, status: 'CONFIRMED', checked_in_at: null, attendee_name: 'Asha', ...change });
const checkIn = (ticketId = 'tkt-abc', auth = ORGANIZER) =>
  request(app).post('/api/events/10/checkins').set('Authorization', auth).send({ ticketId });

beforeEach(() => {
  jest.resetAllMocks();
  db.pool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({});
  authRepository.isTokenRevoked.mockResolvedValue(false);
  repository.findEvent.mockResolvedValue(event);
  repository.markCheckedIn.mockResolvedValue('2026-11-10T04:30:00Z');
});

describe('POST /api/events/:id/checkins (EVT-F-030)', () => {
  it('checks in a confirmed ticket, shows the attendee name and audits it', async () => {
    repository.lockByTicket.mockResolvedValue(reg());
    const res = await checkIn();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ registrationId: 100, attendeeName: 'Asha', ticketId: 'TKT-ABC' });
    expect(repository.lockByTicket.mock.calls[0][1]).toBe('TKT-ABC');
    expect(audit).toHaveBeenCalledWith(5, 'CHECK_IN', { eventId: 10, ticketId: 'TKT-ABC' }, mockClient);
    expect(mockClient.query.mock.calls.map((c) => c[0])).toEqual(['BEGIN', 'COMMIT']);
  });

  it('requires a ticket ID', async () => {
    const res = await checkIn('  ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('refuses another organizer’s event with 403', async () => {
    const res = await checkIn('TKT-ABC', OTHER_ORGANIZER);
    expect(res.status).toBe(403);
    expect(repository.markCheckedIn).not.toHaveBeenCalled();
  });

  it('refuses attendees with 403', async () => {
    expect((await checkIn('TKT-ABC', ATTENDEE)).status).toBe(403);
  });

  it('answers 404 for an unknown event', async () => {
    repository.findEvent.mockResolvedValue(null);
    expect((await checkIn()).status).toBe(404);
  });
});

describe('rejected tickets (EVT-F-031)', () => {
  it.each([
    ['an unknown ticket', null, 404, 'NOT_FOUND', 'Invalid ticket'],
    ['a ticket of another event', reg({ event_id: 11 }), 404, 'NOT_FOUND', 'different event'],
    ['a ticket already used', reg({ status: 'CHECKED_IN', checked_in_at: '2026-11-10T04:00:00Z' }), 409, 'TICKET_ALREADY_USED', 'already used'],
    ['a cancelled registration', reg({ status: 'CANCELLED' }), 409, 'INVALID_STATE', 'cancelled'],
    ['a waitlisted registration', reg({ status: 'WAITLISTED' }), 409, 'INVALID_STATE', 'waitlist'],
  ])('rejects %s with its own message', async (_label, found, status, code, text) => {
    repository.lockByTicket.mockResolvedValue(found);
    const res = await checkIn();
    expect(res.status).toBe(status);
    expect(res.body.error.code).toBe(code);
    expect(res.body.error.message).toContain(text);
    expect(repository.markCheckedIn).not.toHaveBeenCalled();
    expect(mockClient.query.mock.calls.map((c) => c[0])).toEqual(['BEGIN', 'ROLLBACK']);
  });

  it('refuses check-in for a cancelled event', async () => {
    repository.findEvent.mockResolvedValue({ ...event, status: 'CANCELLED' });
    const res = await checkIn();
    expect(res.status).toBe(409);
    expect(repository.lockByTicket).not.toHaveBeenCalled();
  });
});
