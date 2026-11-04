// Database access for users and logged-out tokens. All queries are parameterized.
const db = require('../../config/db');

const USER_COLUMNS = 'id, name, email, password_hash, phone, role, active, created_at';

async function findUserByEmail(email) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash, phone, role }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_COLUMNS}`,
    [name, email, passwordHash, phone || null, role]
  );
  return rows[0];
}

async function revokeToken(tokenId, expiresAt) {
  await db.query(
    'INSERT INTO revoked_tokens (token_id, expires_at) VALUES ($1, $2) ON CONFLICT (token_id) DO NOTHING',
    [tokenId, expiresAt]
  );
}

async function isTokenRevoked(tokenId) {
  const { rowCount } = await db.query('SELECT 1 FROM revoked_tokens WHERE token_id = $1', [tokenId]);
  return rowCount > 0;
}

module.exports = { findUserByEmail, findUserById, createUser, revokeToken, isTokenRevoked };
