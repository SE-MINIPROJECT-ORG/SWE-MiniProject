require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  mailFrom: process.env.MAIL_FROM || 'EMS <no-reply@ems.test>',
  // Requests per minute per IP (EVT-SR-007). Raise only for load testing.
  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  loginRateLimit: parseInt(process.env.LOGIN_RATE_LIMIT || '10', 10),
};

module.exports = config;
