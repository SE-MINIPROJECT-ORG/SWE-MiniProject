import { describe, it, expect } from 'vitest';
import { validateSignUp, fieldErrors, validatePasswordChange } from './validation.js';

const valid = { name: 'Asha Rao', email: 'asha@test.com', password: 'Passw0rd1' };

describe('validateSignUp', () => {
  it('accepts valid details', () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it('rejects a short password', () => {
    expect(validateSignUp({ ...valid, password: 'abc12' }).password).toMatch(/at least 8/);
  });

  it('rejects a password without a digit', () => {
    expect(validateSignUp({ ...valid, password: 'Password' }).password).toMatch(/letter and a digit/);
  });

  it('rejects an invalid email and an empty name', () => {
    const errors = validateSignUp({ ...valid, email: 'asha@', name: ' ' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'name']);
  });
});

describe('fieldErrors', () => {
  it('maps backend details to form fields', () => {
    expect(fieldErrors({ details: [{ field: 'email', message: 'Bad' }] })).toEqual({ email: 'Bad' });
  });
});

describe('validatePasswordChange', () => {
  const ok = { currentPassword: 'Passw0rd1', newPassword: 'Newpass22', confirmPassword: 'Newpass22' };

  it('accepts a valid change', () => {
    expect(validatePasswordChange(ok)).toEqual({});
  });

  it('requires the current password and a matching, valid new one', () => {
    expect(Object.keys(validatePasswordChange({ ...ok, currentPassword: '' }))).toEqual(['currentPassword']);
    expect(validatePasswordChange({ ...ok, newPassword: 'short', confirmPassword: 'short' }).newPassword).toMatch(/8 characters/);
    expect(validatePasswordChange({ ...ok, confirmPassword: 'Other123' }).confirmPassword).toMatch(/do not match/);
  });
});
