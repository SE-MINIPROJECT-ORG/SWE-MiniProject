// Inserts categories and the standard test accounts from the Test Plan.
// All accounts use the password Test@1234. Running it again changes nothing.
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');
const config = require('../src/config/env');

const TEST_PASSWORD = 'Test@1234';

const CATEGORIES = ['Technology', 'Music', 'Sports', 'Workshop', 'Cultural'];

const USERS = [
  { name: 'Attendee One', email: 'attendee1@ems.test', role: 'ATTENDEE' },
  { name: 'Attendee Two', email: 'attendee2@ems.test', role: 'ATTENDEE' },
  { name: 'Attendee Three', email: 'attendee3@ems.test', role: 'ATTENDEE' },
  { name: 'Attendee Four', email: 'attendee4@ems.test', role: 'ATTENDEE' },
  { name: 'Organizer One', email: 'organizer1@ems.test', role: 'ORGANIZER' },
  { name: 'Organizer Two', email: 'organizer2@ems.test', role: 'ORGANIZER' },
  { name: 'Admin', email: 'admin@ems.test', role: 'ADMIN' },
];

async function seed(client) {
  for (const name of CATEGORIES) {
    await client.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
  }

  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  for (const u of USERS) {
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, hash, u.role]
    );
  }
}

if (require.main === module) {
  (async () => {
    if (config.nodeEnv === 'production') {
      console.error('Refusing to seed test accounts in production.');
      process.exitCode = 1;
      await pool.end();
      return;
    }
    let client;
    try {
      client = await pool.connect();
      await seed(client);
      console.log(`Seeded ${CATEGORIES.length} categories and ${USERS.length} test accounts.`);
    } catch (err) {
      console.error(`Seeding failed: ${err.message}`);
      process.exitCode = 1;
    } finally {
      if (client) client.release();
      await pool.end();
    }
  })();
}

module.exports = { seed, CATEGORIES, USERS, TEST_PASSWORD };
