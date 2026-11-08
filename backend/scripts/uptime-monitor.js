// EVT-NF-002: pings the health check once a minute and reports the uptime percentage.
//   node scripts/uptime-monitor.js                 (runs until stopped with Ctrl+C)
// Settings: HEALTH_URL (default http://localhost:5000/health), INTERVAL_SECONDS (default 60),
// CHECKS (stop after this many pings; default runs forever).
const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:5000/health';
const INTERVAL_SECONDS = parseInt(process.env.INTERVAL_SECONDS || '60', 10);
const MAX_CHECKS = process.env.CHECKS ? parseInt(process.env.CHECKS, 10) : Infinity;
const TARGET = 99;

let checks = 0;
let up = 0;

async function ping() {
  const started = Date.now();
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(5000) });
    const body = await res.json().catch(() => ({}));
    return { ok: res.status === 200 && body.database === 'up', detail: `HTTP ${res.status}`, ms: Date.now() - started };
  } catch (err) {
    return { ok: false, detail: err.name === 'TimeoutError' ? 'timeout' : 'unreachable', ms: Date.now() - started };
  }
}

function summary() {
  const percent = checks ? ((up / checks) * 100).toFixed(2) : '0.00';
  const verdict = Number(percent) >= TARGET ? 'meets' : 'below';
  return `${up}/${checks} checks up, uptime ${percent}% (${verdict} the ${TARGET}% target)`;
}

async function tick() {
  const result = await ping();
  checks += 1;
  if (result.ok) up += 1;
  console.log(`${new Date().toISOString()}  ${result.ok ? 'UP  ' : 'DOWN'}  ${result.detail}  ${result.ms} ms  | ${summary()}`);
  if (checks >= MAX_CHECKS) {
    clearInterval(timer);
    console.log(`Finished: ${summary()}`);
  }
}

const timer = setInterval(tick, INTERVAL_SECONDS * 1000);
process.on('SIGINT', () => {
  console.log(`\nStopped: ${summary()}`);
  process.exit(0);
});
console.log(`Checking ${HEALTH_URL} every ${INTERVAL_SECONDS} s. Press Ctrl+C to stop.`);
tick();
