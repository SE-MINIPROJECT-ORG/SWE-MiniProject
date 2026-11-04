const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/utils/auditLogger', () => ({
  audit: jest.fn(),
  ACTIONS: { LOGIN_SUCCESS: 'LOGIN_SUCCESS', LOGIN_FAILED: 'LOGIN_FAILED' },
}));

const repository = require('../src/modules/auth/auth.repository');
const { audit } = require('../src/utils/auditLogger');
const app = require('../src/app');

const passwordHash = bcrypt.hashSync('Passw0rd1', 10);
const asha = {
  id: 1, name: 'Asha Rao', email: 'asha@test.com', password_hash: passwordHash,
  phone: null, role: 'ATTENDEE', active: true, created_at: '2026-10-29T00:00:00Z',
};

beforeEach(() => {
  jest.resetAllMocks();
  repository.isTokenRevoked.mockResolvedValue(false);
});

describe('POST /api/auth/register (EVT-F-001)', () => {
  const body = { name: 'Asha Rao', email: 'asha@test.com', password: 'Passw0rd1', role: 'ATTENDEE' };

  it('creates the account with a bcrypt hash and returns the user without the hash', async () => {
    repository.findUserByEmail.mockResolvedValue(null);
    repository.createUser.mockImplementation(async (u) => ({ ...asha, password_hash: u.passwordHash }));

    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'asha@test.com', role: 'ATTENDEE' });
    expect(JSON.stringify(res.body)).not.toContain('password');
    const stored = repository.createUser.mock.calls[0][0].passwordHash;
    expect(stored).toMatch(/^\$2[aby]\$10\$/); // bcrypt, cost 10 (EVT-SR-001)
    expect(stored).not.toContain('Passw0rd1');
  });

  it('rejects an email that is already registered with 409 EMAIL_EXISTS', async () => {
    repository.findUserByEmail.mockResolvedValue(asha);
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'EMAIL_EXISTS', message: 'Email already registered' });
  });

  it('rejects invalid input with 400 and field details', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...body, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('password');
    expect(repository.createUser).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login (EVT-F-002)', () => {
  it('returns a signed token valid for 60 minutes and audits the login', async () => {
    repository.findUserByEmail.mockResolvedValue(asha);
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@test.com', password: 'Passw0rd1' });

    expect(res.status).toBe(200);
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ sub: '1', role: 'ATTENDEE' });
    expect(payload.exp - payload.iat).toBe(3600);
    expect(audit).toHaveBeenCalledWith(1, 'LOGIN_SUCCESS', expect.any(Object));
  });

  it('gives the same error for a wrong password and an unknown email (TC-AUTH-09)', async () => {
    repository.findUserByEmail.mockResolvedValueOnce(asha).mockResolvedValueOnce(null);
    const wrongPassword = await request(app).post('/api/auth/login').send({ email: 'asha@test.com', password: 'Wrong123' });
    const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'Passw0rd1' });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body.error).toMatchObject({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      expect(res.body.token).toBeUndefined();
    }
    expect(audit).toHaveBeenCalledWith(1, 'LOGIN_FAILED', expect.any(Object));
    expect(audit).toHaveBeenCalledWith(null, 'LOGIN_FAILED', expect.any(Object));
  });

  it('refuses a deactivated account with 403', async () => {
    repository.findUserByEmail.mockResolvedValue({ ...asha, active: false });
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@test.com', password: 'Passw0rd1' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_DEACTIVATED');
  });
});

describe('protected routes, logout and tokens (EVT-F-004, EVT-SR-002)', () => {
  const sign = (options = {}) =>
    jwt.sign({ role: 'ATTENDEE' }, process.env.JWT_SECRET, { subject: '1', jwtid: 'jti-1', expiresIn: 3600, ...options });

  it('GET /api/users/me returns the profile with a valid token', async () => {
    repository.findUserById.mockResolvedValue(asha);
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${sign()}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('asha@test.com');
  });

  it.each([
    ['no token', null],
    ['a tampered token', `${sign()}x`],
    ['a token signed with another secret', jwt.sign({ role: 'ADMIN' }, 'other', { subject: '1', jwtid: 'j' })],
    ['an expired token', sign({ expiresIn: -10 })],
  ])('rejects %s with 401', async (_label, token) => {
    const req = request(app).get('/api/users/me');
    const res = token ? await req.set('Authorization', `Bearer ${token}`) : await req;
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('logout stores the token ID until expiry, after which the token is refused', async () => {
    const token = sign();
    const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logout.status).toBe(204);
    expect(repository.revokeToken).toHaveBeenCalledWith('jti-1', expect.any(Date));

    repository.isTokenRevoked.mockResolvedValue(true);
    const after = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(401);
  });
});
