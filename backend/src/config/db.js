const { Pool } = require('pg');
const config = require('./env');

// The pool connects lazily, so importing this file never fails when the database is down.
const pool = new Pool({ connectionString: config.databaseUrl });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
