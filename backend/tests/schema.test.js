// Checks the initial migration against the data model in SAD section 4.1.3.
// Reads the SQL file only, so it runs in CI without a database.
const fs = require('fs');
const path = require('path');
const { USERS, CATEGORIES } = require('../db/seed');

const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');

function tableBody(name) {
  const match = sql.match(new RegExp(`CREATE TABLE ${name} \\(([\\s\\S]*?)\\n\\);`));
  return match ? match[1] : null;
}

describe('001_init.sql schema', () => {
  test.each([
    ['users', ['name', 'email', 'password_hash', 'phone', 'role', 'active', 'failed_attempts', 'locked_until', 'created_at']],
    ['categories', ['name']],
    ['events', ['organizer_id', 'category_id', 'title', 'description', 'venue', 'start_time', 'end_time', 'capacity', 'status', 'created_at']],
    ['registrations', ['event_id', 'user_id', 'status', 'ticket_id', 'queue_position', 'created_at', 'checked_in_at', 'reminder_sent_at']],
    ['notifications', ['user_id', 'type', 'message', 'read', 'created_at']],
    ['audit_logs', ['user_id', 'action', 'details', 'created_at']],
    ['revoked_tokens', ['token_id', 'expires_at']],
  ])('table %s has all SAD columns', (table, columns) => {
    const body = tableBody(table);
    expect(body).not.toBeNull();
    for (const column of columns) {
      expect(body).toMatch(new RegExp(`^\\s*${column}\\s`, 'm'));
    }
  });

  test('defines exactly the 7 tables from the SAD', () => {
    const tables = [...sql.matchAll(/CREATE TABLE (\w+)/g)].map((m) => m[1]);
    expect(tables).toHaveLength(7);
  });

  test('restricts statuses and roles to the documented values', () => {
    expect(sql).toContain("role IN ('ATTENDEE', 'ORGANIZER', 'ADMIN')");
    expect(sql).toContain("status IN ('DRAFT', 'PUBLISHED', 'CANCELLED')");
    expect(sql).toContain("status IN ('CONFIRMED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN')");
  });

  test('enforces capacity 1 to 10000 and end after start (EVT-F-011)', () => {
    expect(sql).toContain('CHECK (capacity BETWEEN 1 AND 10000)');
    expect(sql).toContain('CHECK (end_time > start_time)');
  });

  test('allows one active registration per user and event (EVT-F-021)', () => {
    expect(sql).toMatch(/CREATE UNIQUE INDEX \w+\s+ON registrations \(event_id, user_id\)\s+WHERE status <> 'CANCELLED'/);
  });

  test('email and ticket_id are unique', () => {
    expect(tableBody('users')).toMatch(/email\s+VARCHAR\(255\) NOT NULL UNIQUE/);
    expect(tableBody('registrations')).toMatch(/ticket_id\s+VARCHAR\(40\) NOT NULL UNIQUE/);
  });
});

describe('seed data', () => {
  test('has the 7 standard test accounts from the Test Plan', () => {
    expect(USERS.map((u) => u.email)).toEqual([
      'attendee1@ems.test', 'attendee2@ems.test', 'attendee3@ems.test', 'attendee4@ems.test',
      'organizer1@ems.test', 'organizer2@ems.test', 'admin@ems.test',
    ]);
  });

  test('has at least one category', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });
});
