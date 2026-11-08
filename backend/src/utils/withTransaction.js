// Runs work(client) in one database transaction. Any error rolls everything back
// and the connection always goes back to the pool.
const { pool } = require('../config/db');

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = withTransaction;
