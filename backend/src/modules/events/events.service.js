// Business rules for events (F2, Sprint 1: create, validate, publish, browse).
const AppError = require('../../utils/AppError');
const repository = require('./events.repository');
const { validateEvent, validateSearch, PAGE_SIZE } = require('./events.validation');

function toApi(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    venue: row.venue,
    startTime: row.start_time,
    endTime: row.end_time,
    capacity: row.capacity,
    status: row.status,
    categoryId: row.category_id,
    categoryName: row.category_name,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    confirmedCount: row.confirmed_count,
    seatsLeft: Math.max(row.capacity - row.confirmed_count, 0),
    createdAt: row.created_at,
  };
}

function isOwnerOrAdmin(event, user) {
  return Boolean(user) && (user.role === 'ADMIN' || event.organizer_id === user.id);
}

async function createEvent(body, user) {
  const { errors, value } = validateEvent(body);
  if (!errors.length && !(await repository.categoryExists(value.categoryId))) {
    errors.push({ field: 'categoryId', message: 'Category does not exist' });
  }
  if (errors.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid event details', errors);
  }
  // New events start as DRAFT (EVT-F-010).
  return toApi(await repository.createEvent(user.id, value));
}

async function publishEvent(id, user) {
  const event = await repository.findById(id);
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  if (!isOwnerOrAdmin(event, user)) throw new AppError(403, 'FORBIDDEN', 'You can only publish your own events');
  if (event.status !== 'DRAFT') throw new AppError(409, 'INVALID_STATE', 'Only draft events can be published');
  if (new Date(event.start_time) <= new Date()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'The event start time has already passed');
  }
  return toApi(await repository.setStatus(id, 'PUBLISHED'));
}

// Draft events are hidden from everyone except their organizer and admins (EVT-F-013).
// They answer 404, so outsiders cannot even tell that the draft exists.
async function getEvent(id, user) {
  const event = await repository.findById(id);
  if (!event || (event.status === 'DRAFT' && !isOwnerOrAdmin(event, user))) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }
  return toApi(event);
}

async function searchEvents(query) {
  const { errors, value } = validateSearch(query);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid search filters', errors);
  const { rows, total } = await repository.searchPublished(value, PAGE_SIZE);
  return {
    items: rows.map(toApi),
    page: value.page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
}

async function listMyEvents(user) {
  return (await repository.listByOrganizer(user.id)).map(toApi);
}

async function listCategories() {
  return repository.listCategories();
}

module.exports = { createEvent, publishEvent, getEvent, searchEvents, listMyEvents, listCategories, toApi };
