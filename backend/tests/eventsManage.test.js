const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockClient = { query: jest.fn(), release: jest.fn() };
jest.mock('../src/config/db', () => ({ query: jest.fn(), pool: { connect: jest.fn() } }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/events/events.repository');
jest.mock('../src/utils/auditLogger', () => ({ audit: jest.fn(), ACTIONS: { EVENT_CANCELLED: 'EVENT_CANCELLED' } }));
jest.mock('../src/modules/notifications/notification.service', () => ({
  notify: jest.fn(),
  TYPES: { EVENT_CANCELLED: 'EVENT_CANCELLED', PROMOTED: 'PROMOTED' },
}));
jest.mock('../src/modules/registrations/registrations.service', () => ({
  promoteFromWaitlist: jest.fn(),
  notifyPromoted: jest.fn(),
}));

const db = require('../src/config/db');
const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/events/events.repository');
const { audit } = require('../src/utils/auditLogger');
const { notify } = require('../src/modules/notifications/notification.service');
const { promoteFromWaitlist, notifyPromoted } = require('../src/modules/registrations/registrations.service');
const app = require('../src/app');

const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `m-${id}`, expiresIn: 3600 })}`;
const ORGANIZER = token(5, 'ORGANIZER');
const OTHER_ORGANIZER = token(6, 'ORGANIZER');
const ADMIN = token(7, 'ADMIN');
const ATTENDEE = token(1, 'ATTENDEE');

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();
const eventRow = (change = {}) => ({
  id: 10, organizer_id: 5, category_id: 1, title: 'Tech Talk', description: null, venue: 'Hall A',
  start_time: inDays(5), end_time: inDays(6), capacity: 10, status: 'PUBLISHED',
  category_name: 'Technology', organizer_name: 'Organizer One', confirmed_count: 4, created_at: inDays(0), ...change,
});
const body = { title: 'Tech Talk 2', venue: 'Hall B', categoryId: 1, startTime: inDays(5), endTime: inDays(6), capacity: 20 };
const sql = () => mockClient.query.mock.calls.map((c) => c[0]);

beforeEach(() => {
  jest.resetAllMocks();
  db.pool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({});
  authRepository.isTokenRevoked.mockResolvedValue(false);
  repository.categoryExists.mockResolvedValue(true);
  repository.lockEvent.mockResolvedValue(eventRow());
  repository.countSeatsTaken.mockResolvedValue(4);
  repository.updateEvent.mockImplementation(async (_c, _id, e) => eventRow({ capacity: e.capacity, title: e.title }));
  repository.findById.mockResolvedValue(eventRow({ title: 'Tech Talk 2', status: 'CANCELLED' }));
  promoteFromWaitlist.mockResolvedValue([]);
});

describe('PUT /api/events/:id (EVT-F-012)', () => {
  it('saves edits to the organizer’s own event', async () => {
    const res = await request(app).put('/api/events/10').set('Authorization', ORGANIZER).send(body);
    expect(res.status).toBe(200);
    expect(repository.updateEvent.mock.calls[0][2]).toMatchObject({ title: 'Tech Talk 2', capacity: 20 });
    expect(sql()).toEqual(['BEGIN', 'COMMIT']);
  });

  it('fills new seats from the waitlist when the capacity grows (EVT-F-024)', async () => {
    promoteFromWaitlist.mockResolvedValue([{ registration: { id: 1 }, user: { id: 2 } }]);
    await request(app).put('/api/events/10').set('Authorization', ORGANIZER).send(body);
    expect(promoteFromWaitlist).toHaveBeenCalled();
    expect(notifyPromoted.mock.calls[0][0]).toHaveLength(1);
  });

  it('rejects a capacity below the confirmed registrations with 409', async () => {
    const res = await request(app).put('/api/events/10').set('Authorization', ORGANIZER).send({ ...body, capacity: 3 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CAPACITY_BELOW_CONFIRMED');
    expect(repository.updateEvent).not.toHaveBeenCalled();
    expect(sql()).toEqual(['BEGIN', 'ROLLBACK']);
  });

  it('refuses to edit another organizer’s event with 403', async () => {
    const res = await request(app).put('/api/events/10').set('Authorization', OTHER_ORGANIZER).send(body);
    expect(res.status).toBe(403);
  });

  it('rejects invalid data with 400', async () => {
    const res = await request(app).put('/api/events/10').set('Authorization', ORGANIZER).send({ ...body, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('title');
  });

  it.each([
    ['a cancelled event', { status: 'CANCELLED' }],
    ['an event that has started', { start_time: inDays(-1) }],
  ])('refuses to edit %s with 409', async (_label, change) => {
    repository.lockEvent.mockResolvedValue(eventRow(change));
    const res = await request(app).put('/api/events/10').set('Authorization', ORGANIZER).send(body);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('answers 404 for an unknown event', async () => {
    repository.lockEvent.mockResolvedValue(null);
    expect((await request(app).put('/api/events/99').set('Authorization', ORGANIZER).send(body)).status).toBe(404);
  });
});

describe('POST /api/events/:id/cancel (EVT-F-014)', () => {
  it('cancels the event and its registrations, audits it and notifies attendees', async () => {
    repository.cancelRegistrations.mockResolvedValue([
      { id: 1, user_id: 1, email: 'a1@ems.test', ticket_id: 'T1' },
      { id: 2, user_id: 2, email: 'a2@ems.test', ticket_id: 'T2' },
    ]);
    const res = await request(app).post('/api/events/10/cancel').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
    expect(res.body.event).toMatchObject({ status: 'CANCELLED', registrationsCancelled: 2 });
    expect(repository.markCancelled).toHaveBeenCalledWith(mockClient, 10);
    expect(audit).toHaveBeenCalledWith(5, 'EVENT_CANCELLED', { eventId: 10, registrationsCancelled: 2 }, mockClient);
    expect(notify).toHaveBeenCalledTimes(2);
    expect(notify.mock.calls[0][0]).toBe('EVENT_CANCELLED');
  });

  it('lets an admin cancel any event', async () => {
    repository.cancelRegistrations.mockResolvedValue([]);
    expect((await request(app).post('/api/events/10/cancel').set('Authorization', ADMIN)).status).toBe(200);
  });

  it('refuses another organizer’s event with 403 and changes nothing', async () => {
    const res = await request(app).post('/api/events/10/cancel').set('Authorization', OTHER_ORGANIZER);
    expect(res.status).toBe(403);
    expect(repository.markCancelled).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('refuses to cancel twice with 409', async () => {
    repository.lockEvent.mockResolvedValue(eventRow({ status: 'CANCELLED' }));
    expect((await request(app).post('/api/events/10/cancel').set('Authorization', ORGANIZER)).status).toBe(409);
  });

  it('refuses attendees with 403', async () => {
    expect((await request(app).post('/api/events/10/cancel').set('Authorization', ATTENDEE)).status).toBe(403);
  });
});

describe('categories (EVT-F-015)', () => {
  it('lets an admin add a category', async () => {
    repository.createCategory.mockResolvedValue({ id: 6, name: 'Gaming' });
    const res = await request(app).post('/api/categories').set('Authorization', ADMIN).send({ name: '  Gaming ' });
    expect(res.status).toBe(201);
    expect(repository.createCategory).toHaveBeenCalledWith('Gaming');
  });

  it('rejects a duplicate name with 409', async () => {
    repository.createCategory.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    expect((await request(app).post('/api/categories').set('Authorization', ADMIN).send({ name: 'Music' })).status).toBe(409);
  });

  it('rejects an empty name with 400', async () => {
    expect((await request(app).post('/api/categories').set('Authorization', ADMIN).send({ name: '' })).status).toBe(400);
  });

  it('renames a category', async () => {
    repository.renameCategory.mockResolvedValue({ id: 2, name: 'Live Music' });
    const res = await request(app).put('/api/categories/2').set('Authorization', ADMIN).send({ name: 'Live Music' });
    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('Live Music');
  });

  it('answers 404 when renaming an unknown category', async () => {
    repository.renameCategory.mockResolvedValue(null);
    expect((await request(app).put('/api/categories/99').set('Authorization', ADMIN).send({ name: 'X' })).status).toBe(404);
  });

  it('deletes an unused category', async () => {
    repository.findCategory.mockResolvedValue({ id: 6, name: 'Gaming' });
    repository.countEventsInCategory.mockResolvedValue(0);
    expect((await request(app).delete('/api/categories/6').set('Authorization', ADMIN)).status).toBe(204);
    expect(repository.deleteCategory).toHaveBeenCalledWith(6);
  });

  it('refuses to delete a category in use with a message', async () => {
    repository.findCategory.mockResolvedValue({ id: 1, name: 'Technology' });
    repository.countEventsInCategory.mockResolvedValue(3);
    const res = await request(app).delete('/api/categories/1').set('Authorization', ADMIN);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('used by 3 event(s)');
    expect(repository.deleteCategory).not.toHaveBeenCalled();
  });

  it('only admins can change categories', async () => {
    expect((await request(app).post('/api/categories').set('Authorization', ORGANIZER).send({ name: 'X' })).status).toBe(403);
    expect((await request(app).delete('/api/categories/1').set('Authorization', ORGANIZER)).status).toBe(403);
  });
});
