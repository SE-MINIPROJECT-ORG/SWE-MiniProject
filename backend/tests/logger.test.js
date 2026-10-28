const logger = require('../src/utils/logger');

describe('logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes one JSON line with timestamp, level and message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('hello', { route: '/x' });
    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry).toMatchObject({ level: 'info', message: 'hello', route: '/x' });
    expect(entry.timestamp).toBeDefined();
  });

  it('never writes passwords or tokens', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('login', { password: 'Test@1234', token: 'abc', email: 'a@b.c' });
    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.password).toBe('[REDACTED]');
    expect(entry.token).toBe('[REDACTED]');
    expect(entry.email).toBe('a@b.c');
  });

  it('writes errors to console.error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('failed');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
