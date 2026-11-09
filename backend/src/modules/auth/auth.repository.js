// Database access for users and logged-out tokens. All queries are parameterized.
const db = require('../../config/db');

const USER_COLUMNS = 'id, name, email, password_hash, phone, role, active, failed_attempts, locked_until, created_at';

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

// ---- Account lockout (EVT-F-003) ----

// Counts a failed login. The 5th failure in a row locks the account for 15 minutes
// and resets the counter, so the user gets 5 new tries after the lock ends.
async function recordFailedLogin(id) {
  const { rows } = await db.query(
    `UPDATE users
        SET failed_attempts = CASE WHEN failed_attempts + 1 >= 5 THEN 0 ELSE failed_attempts + 1 END,
            locked_until    = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END
      WHERE id = $1
      RETURNING failed_attempts, locked_until`,
    [id]
  );
  return rows[0];
}

async function resetFailedLogins(id) {
  await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [id]);
}

// ---- Admin user management (EVT-F-006) ----

async function listUsers() {
  const { rows } = await db.query(
    `SELECT id, name, email, phone, role, active, created_at,
            (locked_until IS NOT NULL AND locked_until > NOW()) AS locked
       FROM users ORDER BY created_at, id`
  );
  return rows;
}

async function updateRole(id, role) {
  const { rows } = await db.query(`UPDATE users SET role = $2 WHERE id = $1 RETURNING ${USER_COLUMNS}`, [id, role]);
  return rows[0] || null;
}

// Reactivating also clears any lock, so an admin can unlock an account.
async function updateActive(id, active) {
  const { rows } = await db.query(
    `UPDATE users SET active = $2,
            failed_attempts = CASE WHEN $2 THEN 0 ELSE failed_attempts END,
            locked_until = CASE WHEN $2 THEN NULL ELSE locked_until END
      WHERE id = $1 RETURNING ${USER_COLUMNS}`,
    [id, active]
  );
  return rows[0] || null;
}

// ---- Profile (EVT-F-007) ----

async function updateProfile(id, { name, phone }) {
  const { rows } = await db.query(`UPDATE users SET name = $2, phone = $3 WHERE id = $1 RETURNING ${USER_COLUMNS}`, [
    id,
    name,
    phone,
  ]);
  return rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  await db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);
}

module.exports = {
  findUserByEmail, findUserById, createUser, revokeToken, isTokenRevoked,
  recordFailedLogin, resetFailedLogins, listUsers, updateRole, updateActive, updateProfile, updatePassword,
};
