const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/modules/auth/auth.repository');
jest.mock('../src/modules/reports/reports.repository');

const authRepository = require('../src/modules/auth/auth.repository');
const repository = require('../src/modules/reports/reports.repository');
const { buildReport, csvCell, toCsv } = require('../src/modules/reports/reports.service');
const app = require('../src/app');

const token = (id, role) =>
  `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET, { subject: String(id), jwtid: `r-${id}`, expiresIn: 3600 })}`;
const ORGANIZER = token(5, 'ORGANIZER');
const OTHER_ORGANIZER = token(6, 'ORGANIZER');
const ADMIN = token(7, 'ADMIN');
const ATTENDEE = token(1, 'ATTENDEE');
const event = { id: 10, organizer_id: 5, title: 'Tech Talk', start_time: '2026-11-10T04:30:00Z', capacity: 20, status: 'PUBLISHED' };

beforeEach(() => {
  jest.resetAllMocks();
  authRepository.isTokenRevoked.mockResolvedValue(false);
  repository.findEvent.mockResolvedValue(event);
});

describe('attendance report (EVT-F-035, TC-CHK-07)', () => {
  it('gives 80% for 10 confirmed with 8 checked in', () => {
    expect(buildReport({ CONFIRMED: 2, CHECKED_IN: 8, WAITLISTED: 3, CANCELLED: 1 })).toEqual({
      confirmed: 10, checkedIn: 8, waitlisted: 3, cancelled: 1, attendanceRate: 80,
    });
  });

  it('gives 0% when nobody is confirmed', () => {
    expect(buildReport({}).attendanceRate).toBe(0);
  });

  it('rounds to one decimal place', () => {
    expect(buildReport({ CONFIRMED: 2, CHECKED_IN: 1 }).attendanceRate).toBe(33.3);
  });

  it('returns the report to the organizer', async () => {
    repository.countByStatus.mockResolvedValue({ CONFIRMED: 2, CHECKED_IN: 8 });
    const res = await request(app).get('/api/events/10/report').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ event: { title: 'Tech Talk' }, confirmed: 10, checkedIn: 8, attendanceRate: 80 });
  });

  it('refuses another organizer with 403 and unknown events with 404', async () => {
    expect((await request(app).get('/api/events/10/report').set('Authorization', OTHER_ORGANIZER)).status).toBe(403);
    repository.findEvent.mockResolvedValue(null);
    expect((await request(app).get('/api/events/99/report').set('Authorization', ORGANIZER)).status).toBe(404);
  });

  it('refuses attendees with 403', async () => {
    expect((await request(app).get('/api/events/10/report').set('Authorization', ATTENDEE)).status).toBe(403);
  });
});

describe('attendee CSV (EVT-F-036, TC-CHK-08)', () => {
  const rows = [
    { name: 'Asha Rao', email: 'asha@test.com', status: 'CHECKED_IN', checked_in_at: new Date('2026-11-10T04:35:00Z') },
    { name: 'Rao, "Ravi"', email: 'ravi@test.com', status: 'CONFIRMED', checked_in_at: null },
  ];

  it('has a header and one row per registration with the four columns', () => {
    const lines = toCsv(rows).replace('﻿', '').trim().split('\r\n');
    expect(lines).toEqual([
      'Name,Email,Status,Checked in at',
      'Asha Rao,asha@test.com,CHECKED_IN,2026-11-10T04:35:00.000Z',
      '"Rao, ""Ravi""",ravi@test.com,CONFIRMED,',
    ]);
  });

  it('stops spreadsheet formulas in names (CSV injection)', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+91 98765')).toBe("'+91 98765");
  });

  it('downloads as a CSV file for the organizer', async () => {
    repository.attendees.mockResolvedValue(rows);
    const res = await request(app).get('/api/events/10/attendees.csv').set('Authorization', ORGANIZER);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toBe('attachment; filename="attendees-event-10.csv"');
    expect(res.text).toContain('asha@test.com');
  });

  it('refuses another organizer with 403', async () => {
    expect((await request(app).get('/api/events/10/attendees.csv').set('Authorization', OTHER_ORGANIZER)).status).toBe(403);
  });
});

describe('admin dashboard (EVT-F-037, TC-CHK-09)', () => {
  it('returns totals by role, by event status and of registrations, with zeros filled in', async () => {
    repository.dashboardTotals.mockResolvedValue({
      users: { ATTENDEE: 4, ORGANIZER: 2, ADMIN: 1 },
      events: { PUBLISHED: 3, DRAFT: 1 },
      registrations: { CONFIRMED: 5, WAITLISTED: 2 },
    });
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      users: { ATTENDEE: 4, ORGANIZER: 2, ADMIN: 1, total: 7 },
      events: { DRAFT: 1, PUBLISHED: 3, CANCELLED: 0, total: 4 },
      registrations: { CONFIRMED: 5, WAITLISTED: 2, CANCELLED: 0, CHECKED_IN: 0, total: 7 },
    });
  });

  it('is for admins only', async () => {
    expect((await request(app).get('/api/admin/dashboard').set('Authorization', ORGANIZER)).status).toBe(403);
    expect((await request(app).get('/api/admin/dashboard')).status).toBe(401);
  });
});
