// Business rules for events (F2): create, validate, edit, publish, cancel, browse, categories.
const AppError = require('../../utils/AppError');
const withTransaction = require('../../utils/withTransaction');
const { audit, ACTIONS } = require('../../utils/auditLogger');
const { notify, TYPES } = require('../notifications/notification.service');
const { promoteFromWaitlist, notifyPromoted } = require('../registrations/registrations.service');
const repository = require('./events.repository');
const { validateEvent, validateSearch, validateCategory, PAGE_SIZE } = require('./events.validation');

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

// Checks shared by edit and cancel: the event exists, belongs to the user and has not started.
function assertCanChange(event, user, action) {
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');
  if (!isOwnerOrAdmin(event, user)) throw new AppError(403, 'FORBIDDEN', `You can only ${action} your own events`);
  if (event.status === 'CANCELLED') throw new AppError(409, 'INVALID_STATE', 'This event has been cancelled');
  if (new Date(event.start_time) <= new Date()) {
    throw new AppError(409, 'INVALID_STATE', 'This event has already started');
  }
}

// EVT-F-012: edit own event; capacity can never drop below the seats already taken.
// Extra capacity on a published event fills seats from the waitlist (EVT-F-024).
async function updateEvent(id, body, user) {
  const { errors, value } = validateEvent(body);
  if (!errors.length && !(await repository.categoryExists(value.categoryId))) {
    errors.push({ field: 'categoryId', message: 'Category does not exist' });
  }

  let promoted = [];
  let updated;
  await withTransaction(async (client) => {
    const event = await repository.lockEvent(client, id);
    assertCanChange(event, user, 'edit');
    if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid event details', errors);

    const taken = await repository.countSeatsTaken(client, id);
    if (value.capacity < taken) {
      throw new AppError(409, 'CAPACITY_BELOW_CONFIRMED', `Capacity cannot be less than the ${taken} confirmed registrations`, [
        { field: 'capacity', message: `At least ${taken}` },
      ]);
    }

    updated = await repository.updateEvent(client, id, value);
    if (updated.status === 'PUBLISHED' && value.capacity > event.capacity) {
      promoted = await promoteFromWaitlist(client, updated);
    }
  });

  notifyPromoted(promoted, updated);
  return toApi(await repository.findById(id));
}

// EVT-F-014: cancel own event and all its registrations, audit it (EVT-SR-006)
// and notify every attendee (EVT-F-032).
async function cancelEvent(id, user) {
  let event;
  let cancelled = [];
  await withTransaction(async (client) => {
    event = await repository.lockEvent(client, id);
    assertCanChange(event, user, 'cancel');
    await repository.markCancelled(client, id);
    cancelled = await repository.cancelRegistrations(client, id);
    await audit(user.id, ACTIONS.EVENT_CANCELLED, { eventId: id, registrationsCancelled: cancelled.length }, client);
  });

  for (const row of cancelled) {
    notify(TYPES.EVENT_CANCELLED, { id: row.user_id, email: row.email }, event, row);
  }
  return { ...toApi(await repository.findById(id)), registrationsCancelled: cancelled.length };
}

// ---- Categories (EVT-F-015), admin only ----

function categoryErrors(body) {
  const { errors, value } = validateCategory(body);
  if (errors.length) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid category', errors);
  return value.name;
}

function duplicateName(err) {
  if (err.code === '23505') return new AppError(409, 'INVALID_STATE', 'A category with this name already exists');
  return err;
}

async function createCategory(body) {
  const name = categoryErrors(body);
  try {
    return await repository.createCategory(name);
  } catch (err) {
    throw duplicateName(err);
  }
}

async function renameCategory(id, body) {
  const name = categoryErrors(body);
  let category;
  try {
    category = await repository.renameCategory(id, name);
  } catch (err) {
    throw duplicateName(err);
  }
  if (!category) throw new AppError(404, 'NOT_FOUND', 'Category not found');
  return category;
}

async function deleteCategory(id) {
  if (!(await repository.findCategory(id))) throw new AppError(404, 'NOT_FOUND', 'Category not found');
  const inUse = await repository.countEventsInCategory(id);
  if (inUse > 0) {
    throw new AppError(409, 'INVALID_STATE', `This category is used by ${inUse} event(s) and cannot be deleted`);
  }
  await repository.deleteCategory(id);
}

module.exports = {
  createEvent, publishEvent, getEvent, searchEvents, listMyEvents, listCategories, toApi,
  updateEvent, cancelEvent, createCategory, renameCategory, deleteCategory,
};
