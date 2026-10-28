const request = require('supertest');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const db = require('../src/config/db');
const app = require('../src/app');

describe('GET /health', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 200 when the database is reachable', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ ok: 1 }] });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', api: 'up', database: 'up' });
  });

  it('returns 503 when the database is down', async () => {
    db.query.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'degraded', api: 'up', database: 'down' });
  });

  it('adds a request ID header to every response', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});
