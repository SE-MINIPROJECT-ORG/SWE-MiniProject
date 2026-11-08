const AppError = require('../../utils/AppError');
const service = require('./registrations.service');

function idParam(req, what) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, 'NOT_FOUND', `${what} not found`);
  return id;
}

async function register(req, res) {
  const registration = await service.register(idParam(req, 'Event'), req.user.id);
  res.status(201).json({ registration });
}

async function cancel(req, res) {
  const registration = await service.cancel(idParam(req, 'Registration'), req.user.id);
  res.status(200).json({ registration });
}

async function ticket(req, res) {
  res.status(200).json({ ticket: await service.getTicket(idParam(req, 'Registration'), req.user.id) });
}

async function forEvent(req, res) {
  res.status(200).json(await service.listForEvent(idParam(req, 'Event'), req.user));
}

async function mine(req, res) {
  res.status(200).json({ registrations: await service.listMine(req.user.id) });
}

module.exports = { register, cancel, mine, ticket, forEvent };
