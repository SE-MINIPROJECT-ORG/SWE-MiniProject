const AppError = require('../../utils/AppError');
const service = require('./reports.service');

function eventId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  return id;
}

async function report(req, res) {
  res.status(200).json(await service.getReport(eventId(req), req.user));
}

async function csv(req, res) {
  const { filename, csv: body } = await service.attendeesCsv(eventId(req), req.user);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(body);
}

async function dashboard(req, res) {
  res.status(200).json(await service.dashboard());
}

module.exports = { report, csv, dashboard };
