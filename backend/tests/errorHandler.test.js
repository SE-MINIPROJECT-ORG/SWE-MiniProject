const express = require('express');
const request = require('supertest');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const app = require('../src/app');
const { errorHandler } = require('../src/middleware/errorHandler');
const AppError = require('../src/utils/AppError');

function buildApp(handler) {
  const testApp = express();
  testApp.get('/boom', handler);
  testApp.use(errorHandler);
  return testApp;
}

describe('standard error format', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 404 in the standard format for an unknown route', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found', details: [] },
    });
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/anything')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('formats an AppError with its status and code', async () => {
    const testApp = buildApp((req, res, next) =>
      next(new AppError(409, 'EMAIL_EXISTS', 'Email already registered'))
    );
    const res = await request(testApp).get('/boom');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: 'EMAIL_EXISTS', message: 'Email already registered', details: [] },
    });
  });

  it('hides internal details for unexpected errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const testApp = buildApp(() => {
      throw new Error('secret database detail');
    });
    const res = await request(testApp).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('secret database detail');
  });
});
