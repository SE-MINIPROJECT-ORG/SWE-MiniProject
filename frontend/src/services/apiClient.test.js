import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest } from './apiClient.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('returns the parsed JSON of a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) })
    );
    await expect(apiRequest('/health')).resolves.toEqual({ status: 'ok' });
  });

  it('sends the token in the Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('/api/users/me', { token: 'abc' });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });

  it('throws an error with status and code for a failed response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } }),
      })
    );
    await expect(apiRequest('/api/auth/register', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_EXISTS',
      message: 'Email already registered',
    });
  });
});
