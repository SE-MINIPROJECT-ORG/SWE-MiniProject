// Structured JSON logger. Sensitive fields are never written (SAD section 4.4.4).
const SENSITIVE = ['password', 'token', 'authorization', 'secret'];

function redact(meta) {
  const clean = {};
  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE.some((word) => key.toLowerCase().includes(word));
    clean[key] = isSensitive ? '[REDACTED]' : value;
  }
  return clean;
}

function write(level, message, meta = {}) {
  const entry = { timestamp: new Date().toISOString(), level, message, ...redact(meta) };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

module.exports = {
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  info: (message, meta) => write('info', message, meta),
};
