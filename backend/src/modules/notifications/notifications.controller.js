const AppError = require('../../utils/AppError');
const service = require('./notification.service');

async function mine(req, res) {
  res.status(200).json(await service.listMine(req.user.id));
}

async function markRead(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  res.status(200).json({ notification: await service.markRead(id, req.user.id) });
}

module.exports = { mine, markRead };
