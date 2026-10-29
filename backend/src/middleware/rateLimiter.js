// Limits requests per IP address (EVT-SR-007) and answers with the standard 429 error.
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const ONE_MINUTE = 60 * 1000;

function tooManyRequests(req, res) {
  res.status(429).json({
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again in a minute.',
      details: [],
    },
  });
}

function createLimiter(limit, windowMs = ONE_MINUTE) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyRequests,
  });
}

// 100 API requests per minute per IP, and 10 login attempts per minute per IP.
const apiLimiter = createLimiter(config.apiRateLimit);
const loginLimiter = createLimiter(config.loginRateLimit);

module.exports = { createLimiter, apiLimiter, loginLimiter };
