// Event data rules (EVT-F-011): title required, start in the future, end after start,
// capacity a whole number from 1 to 10000.
function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asDate(value) {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asWholeNumber(value) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isInteger(number) ? number : null;
}

function validateEvent(body = {}, now = new Date()) {
  const errors = [];
  const title = asText(body.title);
  const description = asText(body.description);
  const venue = asText(body.venue);
  const categoryId = asWholeNumber(body.categoryId);
  const startTime = asDate(body.startTime);
  const endTime = asDate(body.endTime);
  const capacity = asWholeNumber(body.capacity);

  if (!title) errors.push({ field: 'title', message: 'Title is required' });
  else if (title.length > 150) errors.push({ field: 'title', message: 'Title must be at most 150 characters' });

  if (description.length > 2000) {
    errors.push({ field: 'description', message: 'Description must be at most 2000 characters' });
  }

  if (!venue) errors.push({ field: 'venue', message: 'Venue is required' });
  else if (venue.length > 200) errors.push({ field: 'venue', message: 'Venue must be at most 200 characters' });

  if (!categoryId || categoryId < 1) errors.push({ field: 'categoryId', message: 'Choose a category' });

  if (!startTime) errors.push({ field: 'startTime', message: 'Start date and time is required' });
  else if (startTime <= now) errors.push({ field: 'startTime', message: 'Start must be in the future' });

  if (!endTime) errors.push({ field: 'endTime', message: 'End date and time is required' });
  else if (startTime && endTime <= startTime) errors.push({ field: 'endTime', message: 'End must be after the start' });

  if (capacity === null || capacity < 1 || capacity > 10000) {
    errors.push({ field: 'capacity', message: 'Capacity must be a whole number from 1 to 10000' });
  }

  return { errors, value: { title, description: description || null, venue, categoryId, startTime, endTime, capacity } };
}

const PAGE_SIZE = 10;

// Query string for browsing (EVT-F-016): q, categoryId, from, to, page.
function validateSearch(query = {}) {
  const errors = [];
  const q = asText(query.q).slice(0, 100);
  const page = query.page === undefined ? 1 : asWholeNumber(query.page);
  const categoryId = query.categoryId === undefined || query.categoryId === '' ? null : asWholeNumber(query.categoryId);
  const from = query.from ? asDate(query.from) : null;
  const to = query.to ? asDate(query.to) : null;

  if (page === null || page < 1) errors.push({ field: 'page', message: 'Page must be 1 or more' });
  if (query.categoryId && categoryId === null) errors.push({ field: 'categoryId', message: 'Invalid category' });
  if (query.from && !from) errors.push({ field: 'from', message: 'Invalid from date' });
  if (query.to && !to) errors.push({ field: 'to', message: 'Invalid to date' });

  return { errors, value: { q, page, categoryId, from, to } };
}

module.exports = { validateEvent, validateSearch, PAGE_SIZE };
