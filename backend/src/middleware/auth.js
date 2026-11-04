// Checks the JWT on protected routes (EVT-SR-002, EVT-F-004).
// Missing, tampered, expired or revoked tokens get HTTP 401.
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const authRepository = require('../modules/auth/auth.repository');

function unauthorized(message = 'Authentication required') {
  return new AppError(401, 'UNAUTHORIZED', message);
}

async function authenticate(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw unauthorized();
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch (err) {
      throw unauthorized('Invalid or expired token');
    }

    if (await authRepository.isTokenRevoked(payload.jti)) {
      throw unauthorized('Token has been revoked');
    }

    req.user = { id: Number(payload.sub), role: payload.role, jti: payload.jti, exp: payload.exp };
    next();
  } catch (err) {
    next(err);
  }
}

// For public routes that show more to a logged-in user (for example the owner of a draft event).
function optionalAuth(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };
