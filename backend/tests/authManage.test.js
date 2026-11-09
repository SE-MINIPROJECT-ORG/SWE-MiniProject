const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/utils/auditLogger', () => ({
  audit: jest.fn(),
  ACTIONS: { LOGIN_SUCCESS: 'LOGIN_SUCCESS', LOGIN_FAILED: 'LOGIN_FAILED', ROLE_CHANGED: 'ROLE_CHANGED', ACCOUNT_STATUS_CHANGED: 'ACCOUNT_STATUS_CHANGED' },
}));

const repository = require('../src/modules/auth/auth.repository');
const { audit } = require('../src/utils/auditLogger');
const app = require('../src/app');

const passwordHash = bcrypt.hashSync('Passw0rd1', 4);
const asha = (change = {}) => ({
  id: 1, name: 'Asha Rao', email: 'asha@test.com', password_hash: passwordHash, phone: null, role: 'ATTENDEE',
  active: true, failed_attempts: 0, locked_until: null, created_at: '2026-10-29T00:00:00Z', ...change,
});
const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `a-${id}`, expiresIn: 3600 })}`;
const ADMIN = token(7, 'ADMIN');
const ATTENDEE = token(1, 'ATTENDEE');
const login = (password) => request(app).post('/api/auth/login').send({ email: 'asha@test.com', password });

beforeEach(() => {
  jest.resetAllMocks();
  repository.isTokenRevoked.mockResolvedValue(false);
});

describe('account lockout (EVT-F-003, TC-AUTH-04)', () => {
  it('counts a failed login', async () => {
    repository.findUserByEmail.mockResolvedValue(asha());
    const res = await login('Wrong123');
    expect(res.status).toBe(401);
    expect(repository.recordFailedLogin).toHaveBeenCalledWith(1);
  });

  it('refuses a locked account with 423 even with the correct password', async () => {
    repository.findUserByEmail.mockResolvedValue(asha({ locked_until: new Date(Date.now() + 10 * 60000).toISOString() }));
    const res = await login('Passw0rd1');
    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
    expect(res.body.error.message).toContain('10 minute');
    expect(res.body.token).toBeUndefined();
    expect(repository.recordFailedLogin).not.toHaveBeenCalled();
  });

  it('allows login again after the lock has expired and clears the counter', async () => {
    repository.findUserByEmail.mockResolvedValue(asha({ failed_attempts: 0, locked_until: new Date(Date.now() - 1000).toISOString() }));
    const res = await login('Passw0rd1');
    expect(res.status).toBe(200);
    expect(repository.resetFailedLogins).toHaveBeenCalledWith(1);
  });

  it('clears earlier failures after a successful login', async () => {
    repository.findUserByEmail.mockResolvedValue(asha({ failed_attempts: 3 }));
    expect((await login('Passw0rd1')).status).toBe(200);
    expect(repository.resetFailedLogins).toHaveBeenCalled();
  });

  it('does not count failures for an unknown email', async () => {
    repository.findUserByEmail.mockResolvedValue(null);
    await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'x' });
    expect(repository.recordFailedLogin).not.toHaveBeenCalled();
  });
});

describe('profile (EVT-F-007, TC-AUTH-08)', () => {
  it('updates name and phone', async () => {
    repository.updateProfile.mockResolvedValue(asha({ name: 'Asha R', phone: '9876543210' }));
    const res = await request(app).put('/api/users/me').set('Authorization', ATTENDEE).send({ name: 'Asha R', phone: '9876543210' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: 'Asha R', phone: '9876543210' });
    expect(repository.updateProfile).toHaveBeenCalledWith(1, { name: 'Asha R', phone: '9876543210' });
  });

  it('rejects an empty name', async () => {
    const res = await request(app).put('/api/users/me').set('Authorization', ATTENDEE).send({ name: ' ' });
    expect(res.status).toBe(400);
  });

  it('changes the password when the current one is right', async () => {
    repository.findUserById.mockResolvedValue(asha());
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', ATTENDEE)
      .send({ currentPassword: 'Passw0rd1', newPassword: 'Newpass22' });
    expect(res.status).toBe(204);
    const [, newHash] = repository.updatePassword.mock.calls[0];
    expect(bcrypt.compareSync('Newpass22', newHash)).toBe(true);
  });

  it('rejects a wrong current password with 403', async () => {
    repository.findUserById.mockResolvedValue(asha());
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', ATTENDEE)
      .send({ currentPassword: 'Wrong123', newPassword: 'Newpass22' });
    expect(res.status).toBe(403);
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it('rejects a weak new password with 400', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', ATTENDEE)
      .send({ currentPassword: 'Passw0rd1', newPassword: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('newPassword');
  });
});

describe('admin user management (EVT-F-006, TC-AUTH-07)', () => {
  it('lists users without password hashes', async () => {
    repository.listUsers.mockResolvedValue([asha({ locked: false })]);
    const res = await request(app).get('/api/users').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.users[0]).toMatchObject({ email: 'asha@test.com', active: true, locked: false });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('changes a role and audits it', async () => {
    repository.findUserById.mockResolvedValue(asha());
    repository.updateRole.mockResolvedValue(asha({ role: 'ORGANIZER' }));
    const res = await request(app).patch('/api/users/1/role').set('Authorization', ADMIN).send({ role: 'ORGANIZER' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ORGANIZER');
    expect(audit).toHaveBeenCalledWith(7, 'ROLE_CHANGED', { targetUserId: 1, from: 'ATTENDEE', to: 'ORGANIZER' });
  });

  it('rejects an unknown role with 400', async () => {
    expect((await request(app).patch('/api/users/1/role').set('Authorization', ADMIN).send({ role: 'BOSS' })).status).toBe(400);
  });

  it('deactivates and reactivates an account', async () => {
    repository.updateActive.mockResolvedValue(asha({ active: false }));
    const res = await request(app).patch('/api/users/1/status').set('Authorization', ADMIN).send({ active: false });
    expect(res.status).toBe(200);
    expect(res.body.user.active).toBe(false);
    expect(repository.updateActive).toHaveBeenCalledWith(1, false);
    expect(audit).toHaveBeenCalledWith(7, 'ACCOUNT_STATUS_CHANGED', { targetUserId: 1, active: false });
  });

  it('refuses to change the admin’s own account with 409', async () => {
    expect((await request(app).patch('/api/users/7/status').set('Authorization', ADMIN).send({ active: false })).status).toBe(409);
    expect((await request(app).patch('/api/users/7/role').set('Authorization', ADMIN).send({ role: 'ATTENDEE' })).status).toBe(409);
  });

  it('answers 404 for an unknown user', async () => {
    repository.updateActive.mockResolvedValue(null);
    expect((await request(app).patch('/api/users/99/status').set('Authorization', ADMIN).send({ active: true })).status).toBe(404);
  });

  it('refuses non-admins with 403', async () => {
    expect((await request(app).get('/api/users').set('Authorization', ATTENDEE)).status).toBe(403);
  });
});
