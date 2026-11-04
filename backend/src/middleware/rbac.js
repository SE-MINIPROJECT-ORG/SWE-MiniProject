// Role-based access control (EVT-F-005): a user without the right role gets HTTP 403.
const AppError = require('../utils/AppError');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'You do not have permission for this action'));
    }
    return next();
  };
}

module.exports = { requireRole };
