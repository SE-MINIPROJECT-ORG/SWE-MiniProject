const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/events/events.repository');

const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/events/events.repository');
const app = require('../src/app');

const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `t-${id}`, expiresIn: 3600 })}`;
const ORGANIZER = token(5, 'ORGANIZER');
const OTHER_ORGANIZER = token(6, 'ORGANIZER');
const ATTENDEE = token(1, 'ATTENDEE');

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();
const eventRow = (change = {}) => ({
  id: 10, organizer_id: 5, category_id: 1, title: 'Tech Talk', description: null, venue: 'Hall A',
  start_time: inDays(5), end_time: inDays(6), capacity: 50, status: 'DRAFT',
  category_name: 'Technology', organizer_name: 'Organizer One', confirmed_count: 0, created_at: inDays(0),
  ...change,
});
const body = { title: 'Tech Talk', venue: 'Hall A', categoryId: 1, startTime: inDays(5), endTime: inDays(6), capacity: 50 };

beforeEach(() => {
  jest.resetAllMocks();
  authRepository.isTokenRevoked.mockResolvedValue(false);
});

describe('POST /api/events (EVT-F-010, EVT-F-011)', () => {
  it('lets an organizer create an event, which starts as DRAFT', async () => {
    repository.categoryExists.mockResolvedValue(true);
    repository.createEvent.mockResolvedValue(eventRow());
    const res = await request(app).post('/api/events').set('Authorization', ORGANIZER).send(body);
    expect(res.status).toBe(201);
    expect(res.body.event).toMatchObject({ title: 'Tech Talk', status: 'DRAFT', seatsLeft: 50 });
    expect(repository.createEvent.mock.calls[0][0]).toBe(5);
  });

  it('rejects invalid data with 400 and field details', async () => {
    const res = await request(app).post('/api/events').set('Authorization', ORGANIZER).send({ ...body, capacity: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([expect.objectContaining({ field: 'capacity' })]);
    expect(repository.createEvent).not.toHaveBeenCalled();
  });

  it('rejects a category that does not exist', async () => {
    repository.categoryExists.mockResolvedValue(false);
    const res = await request(app).post('/api/events').set('Authorization', ORGANIZER).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('categoryId');
  });

  it('answers 403 when an attendee tries to create an event (EVT-F-005)', async () => {
    const res = await request(app).post('/api/events').set('Authorization', ATTENDEE).send(body);
    expect(res.status).toBe(403);
  });

  it('answers 401 without a token', async () => {
    expect((await request(app).post('/api/events').send(body)).status).toBe(401);
  });
});

describe('POST /api/events/:id/publish (EVT-F-013)', () => {
  it('publishes the organizer’s own draft', async () => {
    repository.findById.mockResolvedValue(eventRow());
    repository.setStatus.mockResolvedValue(eventRow({ status: 'PUBLISHED' }));
    const res = await request(app).post('/api/events/10/publish').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
    expect(res.body.event.status).toBe('PUBLISHED');
  });

  it('refuses to publish another organizer’s event with 403', async () => {
    repository.findById.mockResolvedValue(eventRow());
    const res = await request(app).post('/api/events/10/publish').set('Authorization', OTHER_ORGANIZER);
    expect(res.status).toBe(403);
    expect(repository.setStatus).not.toHaveBeenCalled();
  });

  it('refuses to publish an event that is not a draft with 409', async () => {
    repository.findById.mockResolvedValue(eventRow({ status: 'PUBLISHED' }));
    const res = await request(app).post('/api/events/10/publish').set('Authorization', ORGANIZER);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('answers 404 for an unknown event', async () => {
    repository.findById.mockResolvedValue(null);
    expect((await request(app).post('/api/events/99/publish').set('Authorization', ORGANIZER)).status).toBe(404);
  });
});

describe('GET /api/events/:id (draft visibility, EVT-F-013)', () => {
  it('hides a draft from visitors with 404', async () => {
    repository.findById.mockResolvedValue(eventRow());
    expect((await request(app).get('/api/events/10')).status).toBe(404);
  });

  it('shows a draft to its organizer', async () => {
    repository.findById.mockResolvedValue(eventRow());
    const res = await request(app).get('/api/events/10').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
  });

  it('shows a published event to everyone', async () => {
    repository.findById.mockResolvedValue(eventRow({ status: 'PUBLISHED', confirmed_count: 50 }));
    const res = await request(app).get('/api/events/10');
    expect(res.status).toBe(200);
    expect(res.body.event.seatsLeft).toBe(0);
  });

  it('answers 404 for a non-numeric ID', async () => {
    expect((await request(app).get('/api/events/abc')).status).toBe(404);
  });
});

describe('GET /api/events (EVT-F-016)', () => {
  it('returns one page of 10 with the total', async () => {
    repository.searchPublished.mockResolvedValue({ rows: [eventRow({ status: 'PUBLISHED' })], total: 23 });
    const res = await request(app).get('/api/events?q=tech&page=2');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 2, pageSize: 10, total: 23, totalPages: 3 });
    expect(repository.searchPublished.mock.calls[0][0]).toMatchObject({ q: 'tech', page: 2 });
  });

  it('rejects an invalid filter with 400', async () => {
    expect((await request(app).get('/api/events?from=yesterday')).status).toBe(400);
  });
});

describe('GET /api/events/mine and /api/categories', () => {
  it('lists the organizer’s own events', async () => {
    repository.listByOrganizer.mockResolvedValue([eventRow()]);
    const res = await request(app).get('/api/events/mine').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
    expect(repository.listByOrganizer).toHaveBeenCalledWith(5);
  });

  it('lists categories for everyone', async () => {
    repository.listCategories.mockResolvedValue([{ id: 1, name: 'Technology' }]);
    const res = await request(app).get('/api/categories');
    expect(res.body.categories).toHaveLength(1);
  });
});
