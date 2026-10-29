describe('rate limit settings (EVT-SR-007)', () => {
  it('defaults to 100 API requests and 10 logins per minute', () => {
    jest.isolateModules(() => {
      delete process.env.API_RATE_LIMIT;
      delete process.env.LOGIN_RATE_LIMIT;
      const config = require('../src/config/env');
      expect(config.apiRateLimit).toBe(100);
      expect(config.loginRateLimit).toBe(10);
    });
  });
});
