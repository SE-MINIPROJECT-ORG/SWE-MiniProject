const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

// Converts every error into the standard error response (SAD section 4.4.1).
function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON', details: [] },
    });
  }

  logger.error('Unexpected error', {
    requestId: req.id,
    path: req.originalUrl,
    message: err && err.message,
    stack: err && err.stack,
  });
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      details: [],
      requestId: req.id,
    },
  });
}

module.exports = { notFound, errorHandler };
