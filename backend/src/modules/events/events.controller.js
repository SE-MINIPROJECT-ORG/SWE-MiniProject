const AppError = require('../../utils/AppError');
const service = require('./events.service');

// A non-numeric ID can never match an event.
function eventId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  return id;
}

async function create(req, res) {
  res.status(201).json({ event: await service.createEvent(req.body, req.user) });
}

async function publish(req, res) {
  res.status(200).json({ event: await service.publishEvent(eventId(req), req.user) });
}

async function getOne(req, res) {
  res.status(200).json({ event: await service.getEvent(eventId(req), req.user) });
}

async function search(req, res) {
  res.status(200).json(await service.searchEvents(req.query));
}

async function mine(req, res) {
  res.status(200).json({ events: await service.listMyEvents(req.user) });
}

async function categories(req, res) {
  res.status(200).json({ categories: await service.listCategories() });
}

module.exports = { create, publish, getOne, search, mine, categories };
