// Database access for events and categories. Every value is passed as a query
// parameter, never joined into the SQL text (EVT-SR-003).
const db = require('../../config/db');

// Confirmed and checked-in registrations hold a seat.
const SELECT_EVENT = `
  SELECT e.*, c.name AS category_name, u.name AS organizer_name,
         (SELECT COUNT(*) FROM registrations r
           WHERE r.event_id = e.id AND r.status IN ('CONFIRMED', 'CHECKED_IN'))::int AS confirmed_count
  FROM events e
  JOIN categories c ON c.id = e.category_id
  JOIN users u ON u.id = e.organizer_id`;

async function categoryExists(id) {
  const { rowCount } = await db.query('SELECT 1 FROM categories WHERE id = $1', [id]);
  return rowCount > 0;
}

async function listCategories() {
  const { rows } = await db.query('SELECT id, name FROM categories ORDER BY name');
  return rows;
}

async function createEvent(organizerId, e) {
  const { rows } = await db.query(
    `INSERT INTO events (organizer_id, category_id, title, description, venue, start_time, end_time, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [organizerId, e.categoryId, e.title, e.description, e.venue, e.startTime, e.endTime, e.capacity]
  );
  return findById(rows[0].id);
}

async function findById(id) {
  const { rows } = await db.query(`${SELECT_EVENT} WHERE e.id = $1`, [id]);
  return rows[0] || null;
}

async function setStatus(id, status) {
  await db.query('UPDATE events SET status = $2 WHERE id = $1', [id, status]);
  return findById(id);
}

// Published events that have not started yet, with optional filters, 10 per page (EVT-F-016).
async function searchPublished({ q, categoryId, from, to, page }, pageSize) {
  const conditions = ["e.status = 'PUBLISHED'", 'e.start_time > NOW()'];
  const params = [];

  if (q) {
    // Escape % and _ so they are searched as normal characters.
    params.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
    conditions.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`);
  }
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`e.category_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`e.start_time >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`e.start_time <= $${params.length}`);
  }

  const where = conditions.join(' AND ');
  const total = await db.query(`SELECT COUNT(*)::int AS total FROM events e WHERE ${where}`, params);

  const pageParams = [...params, pageSize, (page - 1) * pageSize];
  const { rows } = await db.query(
    `${SELECT_EVENT} WHERE ${where} ORDER BY e.start_time, e.id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    pageParams
  );
  return { rows, total: total.rows[0].total };
}

async function listByOrganizer(organizerId) {
  const { rows } = await db.query(`${SELECT_EVENT} WHERE e.organizer_id = $1 ORDER BY e.start_time DESC`, [organizerId]);
  return rows;
}

// ---- Edit and cancel (EVT-F-012, EVT-F-014). These run inside a transaction. ----

async function lockEvent(client, id) {
  const { rows } = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
}

async function countSeatsTaken(client, id) {
  const { rows } = await client.query(
    "SELECT COUNT(*)::int AS taken FROM registrations WHERE event_id = $1 AND status IN ('CONFIRMED', 'CHECKED_IN')",
    [id]
  );
  return rows[0].taken;
}

async function updateEvent(client, id, e) {
  const { rows } = await client.query(
    `UPDATE events SET category_id = $2, title = $3, description = $4, venue = $5,
            start_time = $6, end_time = $7, capacity = $8
      WHERE id = $1 RETURNING *`,
    [id, e.categoryId, e.title, e.description, e.venue, e.startTime, e.endTime, e.capacity]
  );
  return rows[0];
}

async function markCancelled(client, id) {
  await client.query("UPDATE events SET status = 'CANCELLED' WHERE id = $1", [id]);
}

// Cancels every active registration and returns who to notify.
async function cancelRegistrations(client, eventId) {
  const { rows } = await client.query(
    `UPDATE registrations r SET status = 'CANCELLED', queue_position = NULL
       FROM users u
      WHERE u.id = r.user_id AND r.event_id = $1 AND r.status IN ('CONFIRMED', 'WAITLISTED')
     RETURNING r.id, r.ticket_id, u.id AS user_id, u.name, u.email`,
    [eventId]
  );
  return rows;
}

// ---- Categories (EVT-F-015) ----

async function findCategory(id) {
  const { rows } = await db.query('SELECT id, name FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createCategory(name) {
  const { rows } = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING id, name', [name]);
  return rows[0];
}

async function renameCategory(id, name) {
  const { rows } = await db.query('UPDATE categories SET name = $2 WHERE id = $1 RETURNING id, name', [id, name]);
  return rows[0] || null;
}

async function countEventsInCategory(id) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM events WHERE category_id = $1', [id]);
  return rows[0].n;
}

async function deleteCategory(id) {
  await db.query('DELETE FROM categories WHERE id = $1', [id]);
}

module.exports = {
  categoryExists, listCategories, createEvent, findById, setStatus, searchPublished, listByOrganizer,
  lockEvent, countSeatsTaken, updateEvent, markCancelled, cancelRegistrations,
  findCategory, createCategory, renameCategory, countEventsInCategory, deleteCategory,
};
