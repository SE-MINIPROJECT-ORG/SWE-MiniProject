// Express 4 does not catch errors from async route handlers.
// This wrapper passes them to the central error handler.
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
