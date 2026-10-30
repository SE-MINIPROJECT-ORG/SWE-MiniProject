// Writes security events to the audit_logs table (EVT-SR-006).
// A failed audit write is logged but never breaks the user's request.
const db = require('../config/db');
const logger = require('./logger');

const ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  CHECK_IN: 'CHECK_IN',
};

// Keys that must never be stored, even if a caller passes them by mistake.
const FORBIDDEN_KEYS = ['password', 'token', 'secret', 'authorization'];

function cleanDetails(details) {
  const clean = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (!FORBIDDEN_KEYS.some((word) => key.toLowerCase().includes(word))) {
      clean[key] = value;
    }
  }
  return clean;
}

async function audit(userId, action, details = {}, client = db) {
  try {
    await client.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [
      userId || null,
      action,
      JSON.stringify(cleanDetails(details)),
    ]);
  } catch (err) {
    logger.error('Audit log write failed', { action, message: err.message });
  }
}

module.exports = { audit, ACTIONS, cleanDetails };
