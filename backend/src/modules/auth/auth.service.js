// Business rules for sign-up, login and logout (F1).
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const AppError = require('../../utils/AppError');
const { audit, ACTIONS } = require('../../utils/auditLogger');
const repository = require('./auth.repository');
const { validateRegistration, validateLogin } = require('./auth.validation');

const BCRYPT_COST = 10; // EVT-SR-001
const TOKEN_LIFETIME_SECONDS = 60 * 60; // 60 minutes, EVT-SR-002

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
  const passwordOk = user ? await bcrypt.compare(value.password, user.password_hash) : false;

  // Same message for unknown email and wrong password (EVT-F-002, TC-AUTH-09).
  if (!passwordOk) {
    await audit(user ? user.id : null, ACTIONS.LOGIN_FAILED, { email: value.email, ip });
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.active) {
    await audit(user.id, ACTIONS.LOGIN_FAILED, { reason: 'deactivated', ip });
    throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated');
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

module.exports = { register, login, logout, getProfile, toPublicUser, BCRYPT_COST, TOKEN_LIFETIME_SECONDS };
