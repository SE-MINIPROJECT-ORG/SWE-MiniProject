// Applies every .sql file in db/migrations once, in name order.
// Applied files are recorded in schema_migrations, so running it again is safe.
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate(client) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       filename   VARCHAR(255) PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  );

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  const applied = [];

  for (const file of files) {
    const done = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
    if (done.rowCount > 0) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      applied.push(file);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`);
    }
  }
  return applied;
}

if (require.main === module) {
  (async () => {
    let client;
    try {
      client = await pool.connect();
      const applied = await migrate(client);
      console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date.');
    } catch (err) {
      console.error(`Migration failed: ${err.message}`);
      process.exitCode = 1;
    } finally {
      if (client) client.release();
      await pool.end();
    }
  })();
}

module.exports = { migrate };
