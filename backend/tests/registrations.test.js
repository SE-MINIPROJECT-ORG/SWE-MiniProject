const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockClient = { query: jest.fn(), release: jest.fn() };
jest.mock('../src/config/db', () => ({ query: jest.fn(), pool: { connect: jest.fn() } }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/registrations/registrations.repository');
jest.mock('../src/modules/notifications/notification.service', () => ({
  notify: jest.fn(),
  TYPES: { REGISTRATION_CONFIRMED: 'REGISTRATION_CONFIRMED', WAITLISTED: 'WAITLISTED', REGISTRATION_CANCELLED: 'REGISTRATION_CANCELLED' },
}));

const db = require('../src/config/db');
const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/registrations/registrations.repository');
const { notify } = require('../src/modules/notifications/notification.service');
const app = require('../src/app');

const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `t-${id}`, expiresIn: 3600 })}`;
const ATTENDEE = token(1, 'ATTENDEE');
const OTHER_ATTENDEE = token(2, 'ATTENDEE');
const ORGANIZER = token(5, 'ORGANIZER');

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();
const event = (change = {}) => ({ id: 10, title: 'Tech Talk', venue: 'Hall A', capacity: 2, status: 'PUBLISHED', start_time: inDays(5), ...change });
const reg = (change = {}) => ({ id: 100, event_id: 10, user_id: 1, status: 'CONFIRMED', ticket_id: 'TKT-1', queue_position: null, ...change });
const sqlCalls = () => mockClient.query.mock.calls.map((c) => c[0]);

beforeEach(() => {
  jest.resetAllMocks();
  db.pool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({});
  authRepository.isTokenRevoked.mockResolvedValue(false);
  repository.findUser.mockResolvedValue({ id: 1, name: 'Attendee One', email: 'attendee1@ems.test' });
  repository.insert.mockImplementation(async (_c, r) => reg({ status: r.status, ticket_id: r.ticketId, queue_position: r.queuePosition }));
});

describe('POST /api/events/:id/registrations', () => {
  it('confirms a seat with a ticket ID and emails the attendee (EVT-F-020)', async () => {
    repository.lockEvent.mockResolvedValue(event());
    repository.countSeatsTaken.mockResolvedValue(1);

    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);

    expect(res.status).toBe(201);
    expect(res.body.registration.status).toBe('CONFIRMED');
    expect(res.body.registration.ticketId).toMatch(/^TKT-[0-9A-F]{10}$/);
    expect(sqlCalls()).toEqual(['BEGIN', 'COMMIT']);
    expect(notify).toHaveBeenCalledWith('REGISTRATION_CONFIRMED', expect.objectContaining({ email: 'attendee1@ems.test' }), expect.any(Object), expect.any(Object));
  });

  it('puts the attendee on the waitlist when the event is full (EVT-F-022)', async () => {
    repository.lockEvent.mockResolvedValue(event());
    repository.countSeatsTaken.mockResolvedValue(2);
    repository.nextQueuePosition.mockResolvedValue(3);

    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);

    expect(res.status).toBe(201);
    expect(res.body.registration).toMatchObject({ status: 'WAITLISTED', queuePosition: 3 });
    expect(notify.mock.calls[0][0]).toBe('WAITLISTED');
  });

  it('rejects a second active registration with 409 (EVT-F-021)', async () => {
    repository.lockEvent.mockResolvedValue(event());
    repository.findActive.mockResolvedValue({ id: 99 });

    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_REGISTERED');
    expect(sqlCalls()).toEqual(['BEGIN', 'ROLLBACK']);
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('turns a duplicate caught by the database into 409 as well', async () => {
    repository.lockEvent.mockResolvedValue(event());
    repository.countSeatsTaken.mockResolvedValue(0);
    repository.insert.mockRejectedValue(Object.assign(new Error('duplicate'), { code: '23505' }));
    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);
    expect(res.status).toBe(409);
  });

  it.each([
    ['a draft event', { status: 'DRAFT' }],
    ['a cancelled event', { status: 'CANCELLED' }],
    ['an event that has started', { start_time: inDays(-1) }],
  ])('refuses %s with 400 EVENT_NOT_OPEN', async (_label, change) => {
    repository.lockEvent.mockResolvedValue(event(change));
    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('EVENT_NOT_OPEN');
  });

  it('answers 404 for an unknown event', async () => {
    repository.lockEvent.mockResolvedValue(null);
    expect((await request(app).post('/api/events/99/registrations').set('Authorization', ATTENDEE)).status).toBe(404);
  });

  it('answers 403 when an organizer tries to register (EVT-F-005)', async () => {
    expect((await request(app).post('/api/events/10/registrations').set('Authorization', ORGANIZER)).status).toBe(403);
  });

  it('releases the database connection even after an error', async () => {
    repository.lockEvent.mockRejectedValue(new Error('db down'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).post('/api/events/10/registrations').set('Authorization', ATTENDEE);
    expect(res.status).toBe(500);
    expect(mockClient.release).toHaveBeenCalled();
    console.error.mockRestore();
  });
});

describe('POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005)', () => {
  beforeEach(() => repository.lockEvent.mockResolvedValue(event()));

  it('cancels the attendee’s own registration and emails them', async () => {
    repository.findById.mockResolvedValue(reg());
    repository.lockById.mockResolvedValue(reg());
    repository.markCancelled.mockResolvedValue(reg({ status: 'CANCELLED' }));

    const res = await request(app).post('/api/registrations/100/cancel').set('Authorization', ATTENDEE);

    expect(res.status).toBe(200);
    expect(res.body.registration.status).toBe('CANCELLED');
    expect(notify.mock.calls[0][0]).toBe('REGISTRATION_CANCELLED');
  });

  it('refuses to cancel another attendee’s registration with 403', async () => {
    repository.findById.mockResolvedValue(reg({ user_id: 1 }));
    const res = await request(app).post('/api/registrations/100/cancel').set('Authorization', OTHER_ATTENDEE);
    expect(res.status).toBe(403);
    expect(repository.markCancelled).not.toHaveBeenCalled();
  });

  it('refuses to cancel twice with 409', async () => {
    repository.findById.mockResolvedValue(reg({ status: 'CANCELLED' }));
    repository.lockById.mockResolvedValue(reg({ status: 'CANCELLED' }));
    const res = await request(app).post('/api/registrations/100/cancel').set('Authorization', ATTENDEE);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('refuses to cancel after the event has started', async () => {
    repository.lockEvent.mockResolvedValue(event({ start_time: inDays(-1) }));
    repository.findById.mockResolvedValue(reg());
    repository.lockById.mockResolvedValue(reg());
    const res = await request(app).post('/api/registrations/100/cancel').set('Authorization', ATTENDEE);
    expect(res.status).toBe(400);
  });

  it('answers 404 for an unknown registration', async () => {
    repository.findById.mockResolvedValue(null);
    expect((await request(app).post('/api/registrations/5/cancel').set('Authorization', ATTENDEE)).status).toBe(404);
  });
});

describe('GET /api/registrations/me (EVT-F-025)', () => {
  it('lists only the logged-in attendee’s registrations', async () => {
    repository.listForUser.mockResolvedValue([
      { id: 100, status: 'CONFIRMED', ticket_id: 'TKT-1', queue_position: null, event_id: 10, title: 'Tech Talk', venue: 'Hall A', start_time: inDays(5), end_time: inDays(6), event_status: 'PUBLISHED' },
    ]);
    const res = await request(app).get('/api/registrations/me').set('Authorization', ATTENDEE);
    expect(res.status).toBe(200);
    expect(repository.listForUser).toHaveBeenCalledWith(1);
    expect(res.body.registrations[0]).toMatchObject({ status: 'CONFIRMED', event: { title: 'Tech Talk' } });
  });

  it('requires login', async () => {
    expect((await request(app).get('/api/registrations/me')).status).toBe(401);
  });
});
