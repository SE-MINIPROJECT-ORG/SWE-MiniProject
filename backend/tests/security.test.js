// EVT-SR-003: input is validated and cleaned on the server, values reach the database
// only as query parameters, and the API sends security headers.
const request = require('supertest');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const db = require('../src/config/db');
const { cleanText } = require('../src/utils/sanitize');
const { validateEvent } = require('../src/modules/events/events.validation');
const eventsRepository = require('../src/modules/events/events.repository');
const app = require('../src/app');

const INJECTION = "x'; DROP TABLE users; --";

beforeEach(() => db.query.mockReset());

describe('cleanText', () => {
  it('removes control characters and trims, but keeps line breaks', () => {
    expect(cleanText('  Hello\u0000 world\u0007\nline 2  ')).toBe('Hello world\nline 2');
  });

  it('turns non-text input into an empty string', () => {
    expect(cleanText({ $gt: '' })).toBe('');
    expect(cleanText(42)).toBe('');
  });
});

describe('validation rejects bad types', () => {
  it('rejects an object in place of a title', () => {
    const { errors } = validateEvent({ title: { $ne: null }, venue: 'v', categoryId: 1, startTime: 'x', endTime: 'y', capacity: 5 });
    expect(errors.map((e) => e.field)).toContain('title');
  });

  it('rejects a number written as text with SQL in it', () => {
    const { errors } = validateEvent({ title: 't', venue: 'v', categoryId: '1 OR 1=1', startTime: '2030-01-01T10:00:00Z', endTime: '2030-01-01T12:00:00Z', capacity: 5 });
    expect(errors.map((e) => e.field)).toEqual(['categoryId']);
  });
});

describe('parameterized queries', () => {
  it('passes a search keyword with SQL in it only as a parameter', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ total: 0 }] }).mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get(`/api/events?q=${encodeURIComponent(INJECTION)}`);
    expect(res.status).toBe(200);
    for (const [text, params] of db.query.mock.calls) {
      expect(text).not.toContain('DROP TABLE');
      expect(params.join(' ')).toContain('DROP TABLE');
    }
  });

  it('stores a category name with SQL in it only as a parameter', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, name: INJECTION }] });
    await eventsRepository.createCategory(INJECTION);
    expect(db.query.mock.calls[0][0]).not.toContain('DROP');
    expect(db.query.mock.calls[0][1]).toEqual([INJECTION]);
  });

  it('answers 404 for an event ID that is not a number', async () => {
    const res = await request(app).get(`/api/events/${encodeURIComponent('1 OR 1=1')}`);
    expect(res.status).toBe(404);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('security headers', () => {
  it('sends helmet headers on API responses', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get('/api/categories');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
