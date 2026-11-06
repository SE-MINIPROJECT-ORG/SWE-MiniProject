const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { startScheduler } = require('./modules/notifications/scheduler');

// Tokens cannot be signed without a secret (EVT-SR-002), so refuse to start.
if (!config.jwtSecret) {
  logger.error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env and set it.');
  process.exit(1);
}

app.listen(config.port, () => {
  logger.info('EMS backend started', { port: config.port });
  startScheduler();
});
