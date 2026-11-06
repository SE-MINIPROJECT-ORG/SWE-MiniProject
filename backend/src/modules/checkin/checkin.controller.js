const AppError = require('../../utils/AppError');
const service = require('./checkin.service');

async function checkIn(req, res) {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId) || eventId < 1) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  res.status(200).json(await service.checkIn(eventId, req.body, req.user));
}

module.exports = { checkIn };
