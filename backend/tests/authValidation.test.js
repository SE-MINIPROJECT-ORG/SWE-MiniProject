const { validateRegistration, validateLogin } = require('../src/modules/auth/auth.validation');

const valid = { name: 'Asha Rao', email: 'Asha@Test.com', password: 'Passw0rd1', role: 'ATTENDEE' };
const fields = (body) => validateRegistration(body).errors.map((e) => e.field);

describe('sign-up validation (EVT-F-001, TC-AUTH-10)', () => {
  it('accepts valid details and lower-cases the email', () => {
    const { errors, value } = validateRegistration(valid);
    expect(errors).toEqual([]);
    expect(value.email).toBe('asha@test.com');
  });

  it('defaults the role to ATTENDEE', () => {
    expect(validateRegistration({ ...valid, role: undefined }).value.role).toBe('ATTENDEE');
  });

  it.each([
    ['a password shorter than 8 characters', { password: 'abc12' }, 'password'],
    ['a password without a digit', { password: 'Password' }, 'password'],
    ['a password without a letter', { password: '12345678' }, 'password'],
    ['an invalid email', { email: 'asha@' }, 'email'],
    ['an empty name', { name: '   ' }, 'name'],
    ['an invalid phone number', { phone: 'abc' }, 'phone'],
  ])('rejects %s', (_label, change, field) => {
    expect(fields({ ...valid, ...change })).toEqual([field]);
  });

  it('does not let a visitor sign up as ADMIN', () => {
    expect(fields({ ...valid, role: 'ADMIN' })).toEqual(['role']);
  });
});

describe('login validation', () => {
  it('requires email and password', () => {
    expect(validateLogin({}).errors.map((e) => e.field)).toEqual(['email', 'password']);
  });
});
