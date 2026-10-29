// Sends email through SMTP (MailHog during development and testing).
// Each email is tried up to 3 times. A failure is logged and never thrown,
// so a mail problem can never fail the user's request (SAD section 4.4.3).
const nodemailer = require('nodemailer');
const config = require('../../config/env');
const logger = require('../../utils/logger');

const MAX_ATTEMPTS = 3;

const transport = nodemailer.createTransport({
  host: config.smtpHost || 'localhost',
  port: config.smtpPort || 1025,
  secure: false,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendMail({ to, subject, text }, { attempts = MAX_ATTEMPTS, retryDelayMs = 1000 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await transport.sendMail({ from: config.mailFrom, to, subject, text });
      return true;
    } catch (err) {
      logger.warn('Email attempt failed', { attempt, subject, message: err.message });
      if (attempt < attempts) {
        await wait(retryDelayMs * attempt);
      }
    }
  }
  logger.error('Email could not be sent', { subject, attempts });
  return false;
}

module.exports = { sendMail, MAX_ATTEMPTS };
