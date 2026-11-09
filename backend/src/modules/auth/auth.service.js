// Business rules for sign-up, login, lockout, logout, profile and admin user management (F1).
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const AppError = require('../../utils/AppError');
const { audit, ACTIONS } = require('../../utils/auditLogger');
const repository = require('./auth.repository');
const {
  validateRegistration, validateLogin, validateProfile, validatePasswordChange, validateRole, validateStatus,
} = require('./auth.validation');

const BCRYPT_COST = 10; // EVT-SR-001
const TOKEN_LIFETIME_SECONDS = 60 * 60; // 60 minutes, EVT-SR-002

function minutesLeft(until) {
  return Math.max(Math.ceil((new Date(until) - Date.now()) / 60000), 1);
}

// Never return the password hash (EVT-SR-001).
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function register(body) {
  const { errors, value } = validateRegistration(body);
  if (errors.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid sign-up details', errors);
  }

  if (await repository.findUserByEmail(value.email)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(value.password, BCRYPT_COST);
  try {
    const user = await repository.createUser({ ...value, passwordHash });
    return toPublicUser(user);
  } catch (err) {
    // Two sign-ups with the same email at the same moment.
    if (err.code === '23505') {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
    }
    throw err;
  }
}

async function login(body, ip) {
  const { errors, value } = validateLogin(body);
  if (errors.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Email and password are required', errors);
  }

  const user = await repository.findUserByEmail(value.email);

  // A locked account is refused even with the correct password (EVT-F-003).
  if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
    await audit(user.id, ACTIONS.LOGIN_FAILED, { reason: 'locked', ip });
    throw new AppError(
      423,
      'ACCOUNT_LOCKED',
      `Account locked after 5 failed logins. Try again in ${minutesLeft(user.locked_until)} minute(s).`
    );
  }

  const passwordOk = user ? await bcrypt.compare(value.password, user.password_hash) : false;

  // Same message for unknown email and wrong password (EVT-F-002, TC-AUTH-09).
  if (!passwordOk) {
    if (user) await repository.recordFailedLogin(user.id);
    await audit(user ? user.id : null, ACTIONS.LOGIN_FAILED, { email: value.email, ip });
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.active) {
    await audit(user.id, ACTIONS.LOGIN_FAILED, { reason: 'deactivated', ip });
    throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated');
  }

  if (user.failed_attempts > 0 || user.locked_until) {
    await repository.resetFailedLogins(user.id);
  }

  const token = jwt.sign({ role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    subject: String(user.id),
    jwtid: crypto.randomUUID(),
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });

  await audit(user.id, ACTIONS.LOGIN_SUCCESS, { ip });
  return { token, expiresIn: TOKEN_LIFETIME_SECONDS, user: toPublicUser(user) };
}

// Stores the token ID until it expires, so the token is refused from now on (EVT-F-004).
async function logout(tokenUser) {
  await repository.revokeToken(tokenUser.jti, new Date(tokenUser.exp * 1000));
}

async function getProfile(userId) {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return toPublicUser(user);
}

// ---- Profile (EVT-F-007) ----

async function updateProfile(userId, body) {
  const { errors, value } = validateProfile(body);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid profile details', errors);
  const user = await repository.updateProfile(userId, value);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return toPublicUser(user);
}

// The current password must be right before it can be changed.
async function changePassword(userId, body) {
  const { errors, value } = validatePasswordChange(body);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid password details', errors);
  const user = await repository.findUserById(userId);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  if (!(await bcrypt.compare(value.currentPassword, user.password_hash))) {
    throw new AppError(403, 'FORBIDDEN', 'Current password is wrong', [
      { field: 'currentPassword', message: 'Current password is wrong' },
    ]);
  }
  await repository.updatePassword(userId, await bcrypt.hash(value.newPassword, BCRYPT_COST));
}

// ---- Admin user management (EVT-F-006) ----

async function listUsers() {
  const rows = await repository.listUsers();
  return rows.map((row) => ({ ...toPublicUser(row), active: row.active, locked: row.locked }));
}

// An admin cannot change their own role or deactivate themselves, so the system
// can never be left without an admin by mistake.
function assertNotSelf(targetId, admin, action) {
  if (targetId === admin.id) throw new AppError(409, 'INVALID_STATE', `You cannot ${action} your own account`);
}

// The new role applies from the user's next login (AC-EVT-F-006). Audited (EVT-SR-006).
async function changeRole(targetId, body, admin) {
  const { errors, value: role } = validateRole(body);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid role', errors);
  assertNotSelf(targetId, admin, 'change the role of');
  const before = await repository.findUserById(targetId);
  if (!before) throw new AppError(404, 'NOT_FOUND', 'User not found');
  const user = await repository.updateRole(targetId, role);
  await audit(admin.id, ACTIONS.ROLE_CHANGED, { targetUserId: targetId, from: before.role, to: role });
  return { ...toPublicUser(user), active: user.active };
}

// A deactivated user cannot log in (AC-EVT-F-006). Reactivating also unlocks the account.
async function changeStatus(targetId, body, admin) {
  const { errors, value: active } = validateStatus(body);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid status', errors);
  assertNotSelf(targetId, admin, active ? 'reactivate' : 'deactivate');
  const user = await repository.updateActive(targetId, active);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  await audit(admin.id, ACTIONS.ACCOUNT_STATUS_CHANGED, { targetUserId: targetId, active });
  return { ...toPublicUser(user), active: user.active };
}

module.exports = {
  register, login, logout, getProfile, toPublicUser, BCRYPT_COST, TOKEN_LIFETIME_SECONDS,
  updateProfile, changePassword, listUsers, changeRole, changeStatus,
};
