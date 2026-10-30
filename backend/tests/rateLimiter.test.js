const express = require('express');
const request = require('supertest');
const { createLimiter } = require('../src/middleware/rateLimiter');

function appWithLimit(limit) {
  const app = express();
  app.use(createLimiter(limit));
  app.get('/ping', (req, res) => res.json({ ok: true }));
  return app;
}

describe('rateLimiter (EVT-SR-007)', () => {
  it('allows requests up to the limit', async () => {
    const app = appWithLimit(3);
    for (let i = 0; i < 3; i += 1) {
      const res = await request(app).get('/ping');
      expect(res.status).toBe(200);
    }
  });

  it('answers the request after the limit with 429 and the standard error format', async () => {
    const app = appWithLimit(2);
    await request(app).get('/ping');
    await request(app).get('/ping');
    const res = await request(app).get('/ping');
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('sends rate limit headers', async () => {
    const res = await request(appWithLimit(5)).get('/ping');
    expect(res.headers['ratelimit-limit']).toBe('5');
  });
});
