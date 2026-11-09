// EVT-NF-001: 100 simulated users send requests at the same time for a fixed period,
// and the script reports how many finished within 2 seconds (target: at least 95%).
//
// Run against a running backend whose rate limit has been raised, for example:
//   docker compose exec backend node scripts/load-test.js
// Settings: API_URL, USERS (default 100), DURATION (seconds, default 30).
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../src/config/db');
const config = require('../src/config/env');

const API_URL = process.env.API_URL || `http://localhost:${config.port}`;
const USERS = parseInt(process.env.USERS || '100', 10);
const SECONDS = parseInt(process.env.DURATION || '30', 10);
const LIMIT_MS = 2000;
const TARGET_PERCENT = 95;

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

async function timed(path, token) {
  const started = performance.now();
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    await res.arrayBuffer();
    return { ms: performance.now() - started, ok: res.status < 400, status: res.status };
  } catch (err) {
    return { ms: performance.now() - started, ok: false, status: 0 };
  }
}

async function main() {
  // A mix of the most common requests: browse, search, event page, categories, my registrations.
  const { rows: events } = await pool.query("SELECT id FROM events WHERE status = 'PUBLISHED' LIMIT 20");
  const { rows: attendees } = await pool.query("SELECT id FROM users WHERE role = 'ATTENDEE' LIMIT 20");
  await pool.end();
  const tokens = attendees.map((a) =>
    jwt.sign({ role: 'ATTENDEE' }, config.jwtSecret, { subject: String(a.id), jwtid: crypto.randomUUID(), expiresIn: 600 })
  );
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const nextRequest = () => {
    const roll = Math.random();
    if (roll < 0.35) return ['/api/events?page=1'];
    if (roll < 0.55) return ['/api/events?q=a'];
    if (roll < 0.75 && events.length) return [`/api/events/${pick(events).id}`];
    if (roll < 0.85) return ['/api/categories'];
    if (tokens.length) return ['/api/registrations/me', pick(tokens)];
    return ['/health'];
  };

  console.log(`${USERS} users sending requests for ${SECONDS} s to ${API_URL} ...`);
  const results = [];
  const endAt = Date.now() + SECONDS * 1000;
  await Promise.all(
    Array.from({ length: USERS }, async () => {
      while (Date.now() < endAt) {
        const [path, token] = nextRequest();
        results.push(await timed(path, token));
      }
    })
  );

  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const withinLimit = results.filter((r) => r.ok && r.ms <= LIMIT_MS).length;
  const errors = results.filter((r) => !r.ok);
  const percent = (withinLimit / results.length) * 100;
  const limited = errors.filter((r) => r.status === 429).length;

  console.log(`Requests: ${results.length} (${(results.length / SECONDS).toFixed(0)} per second), errors: ${errors.length}`);
  console.log(`Response time: median ${percentile(times, 50).toFixed(0)} ms, p95 ${percentile(times, 95).toFixed(0)} ms, max ${times[times.length - 1].toFixed(0)} ms`);
  console.log(`Within 2 s and successful: ${percent.toFixed(2)}% (target ${TARGET_PERCENT}%)`);
  if (limited > 0) {
    console.log('Some requests hit the rate limit. Restart the backend with API_RATE_LIMIT=1000000 and run again.');
    process.exitCode = 1;
  } else if (percent >= TARGET_PERCENT) {
    console.log('PASS (EVT-NF-001)');
  } else {
    console.log('FAIL (EVT-NF-001)');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`Load test failed: ${err.message}`);
  process.exitCode = 1;
});
