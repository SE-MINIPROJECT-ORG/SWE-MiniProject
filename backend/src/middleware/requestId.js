const crypto = require('crypto');

// Gives every request an ID so a failed request can be found in the logs.
function requestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = requestId;
