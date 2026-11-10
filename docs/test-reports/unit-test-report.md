# Unit Test Report

**Build tested:** `main` at the end of Sprint 2 (development frozen), 10 Nov 2026.
**Frameworks:** Jest 29 with Supertest (backend), Vitest (frontend). Both suites also run in GitHub Actions on every pull request and on every push to `main`.
**How to repeat:** `cd backend` then `npm test`; `cd frontend` then `npm test`.

## Summary

| Suite | Test files | Tests | Passed | Failed |
|-------|-----------|-------|--------|--------|
| Backend (Jest) | 19 | 205 | 205 | 0 |
| Frontend (Vitest) | 7 | 36 | 36 | 0 |
| **Total** | **26** | **241** | **241** | **0** |

## Results by test file

| Test file | Owner | Tests | Passed |
|-----------|-------|-------|--------|
| `backend/tests/auditLogger.test.js` | Nithin | 5 | 5 |
| `backend/tests/auth.test.js` | Varun | 12 | 12 |
| `backend/tests/authManage.test.js` | Varun | 17 | 17 |
| `backend/tests/authValidation.test.js` | Varun | 10 | 10 |
| `backend/tests/checkin.test.js` | Nithin | 11 | 11 |
| `backend/tests/errorHandler.test.js` | Varun | 4 | 4 |
| `backend/tests/events.test.js` | Thanishq | 17 | 17 |
| `backend/tests/eventsManage.test.js` | Thanishq | 21 | 21 |
| `backend/tests/eventsValidation.test.js` | Thanishq | 14 | 14 |
| `backend/tests/health.test.js` | Varun | 3 | 3 |
| `backend/tests/logger.test.js` | Varun | 3 | 3 |
| `backend/tests/notifications.test.js` | Nithin | 19 | 19 |
| `backend/tests/rateLimitConfig.test.js` | Nithin | 1 | 1 |
| `backend/tests/rateLimiter.test.js` | Nithin | 3 | 3 |
| `backend/tests/rbac.test.js` | Varun | 3 | 3 |
| `backend/tests/registrations.test.js` | Vishruta | 28 | 28 |
| `backend/tests/reports.test.js` | Nithin | 12 | 12 |
| `backend/tests/schema.test.js` | Nithin | 14 | 14 |
| `backend/tests/security.test.js` | Thanishq | 8 | 8 |
| `frontend/src/services/apiClient.test.js` | Thanishq | 3 | 3 |
| `frontend/src/utils/events.test.js` | Thanishq | 10 | 10 |
| `frontend/src/utils/navLinks.test.js` | Varun | 5 | 5 |
| `frontend/src/utils/notifications.test.js` | Nithin | 2 | 2 |
| `frontend/src/utils/registrations.test.js` | Vishruta | 7 | 7 |
| `frontend/src/utils/reports.test.js` | Nithin | 2 | 2 |
| `frontend/src/utils/validation.test.js` | Varun | 7 | 7 |

## Every test case

Each line is one automated unit test: the file, the group and the test name, and its result.

### `backend/tests/auditLogger.test.js`

- PASS: auditLogger (EVT-SR-006) > inserts user ID, action and details into audit_logs
- PASS: auditLogger (EVT-SR-006) > stores a null user ID when the user is unknown
- PASS: auditLogger (EVT-SR-006) > never stores passwords or tokens
- PASS: auditLogger (EVT-SR-006) > does not throw when the database write fails
- PASS: auditLogger (EVT-SR-006) > can write inside an existing transaction client

### `backend/tests/auth.test.js`

- PASS: POST /api/auth/register (EVT-F-001) > creates the account with a bcrypt hash and returns the user without the hash
- PASS: POST /api/auth/register (EVT-F-001) > rejects an email that is already registered with 409 EMAIL_EXISTS
- PASS: POST /api/auth/register (EVT-F-001) > rejects invalid input with 400 and field details
- PASS: POST /api/auth/login (EVT-F-002) > returns a signed token valid for 60 minutes and audits the login
- PASS: POST /api/auth/login (EVT-F-002) > gives the same error for a wrong password and an unknown email (TC-AUTH-09)
- PASS: POST /api/auth/login (EVT-F-002) > refuses a deactivated account with 403
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > GET /api/users/me returns the profile with a valid token
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > rejects no token with 401
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > rejects a tampered token with 401
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > rejects a token signed with another secret with 401
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > rejects an expired token with 401
- PASS: protected routes, logout and tokens (EVT-F-004, EVT-SR-002) > logout stores the token ID until expiry, after which the token is refused

### `backend/tests/authManage.test.js`

- PASS: account lockout (EVT-F-003, TC-AUTH-04) > counts a failed login
- PASS: account lockout (EVT-F-003, TC-AUTH-04) > refuses a locked account with 423 even with the correct password
- PASS: account lockout (EVT-F-003, TC-AUTH-04) > allows login again after the lock has expired and clears the counter
- PASS: account lockout (EVT-F-003, TC-AUTH-04) > clears earlier failures after a successful login
- PASS: account lockout (EVT-F-003, TC-AUTH-04) > does not count failures for an unknown email
- PASS: profile (EVT-F-007, TC-AUTH-08) > updates name and phone
- PASS: profile (EVT-F-007, TC-AUTH-08) > rejects an empty name
- PASS: profile (EVT-F-007, TC-AUTH-08) > changes the password when the current one is right
- PASS: profile (EVT-F-007, TC-AUTH-08) > rejects a wrong current password with 403
- PASS: profile (EVT-F-007, TC-AUTH-08) > rejects a weak new password with 400
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > lists users without password hashes
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > changes a role and audits it
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > rejects an unknown role with 400
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > deactivates and reactivates an account
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > refuses to change the admin’s own account with 409
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > answers 404 for an unknown user
- PASS: admin user management (EVT-F-006, TC-AUTH-07) > refuses non-admins with 403

### `backend/tests/authValidation.test.js`

- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > accepts valid details and lower-cases the email
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > defaults the role to ATTENDEE
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects a password shorter than 8 characters
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects a password without a digit
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects a password without a letter
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects an invalid email
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects an empty name
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > rejects an invalid phone number
- PASS: sign-up validation (EVT-F-001, TC-AUTH-10) > does not let a visitor sign up as ADMIN
- PASS: login validation > requires email and password

### `backend/tests/checkin.test.js`

- PASS: POST /api/events/:id/checkins (EVT-F-030) > checks in a confirmed ticket, shows the attendee name and audits it
- PASS: POST /api/events/:id/checkins (EVT-F-030) > requires a ticket ID
- PASS: POST /api/events/:id/checkins (EVT-F-030) > refuses another organizer’s event with 403
- PASS: POST /api/events/:id/checkins (EVT-F-030) > refuses attendees with 403
- PASS: POST /api/events/:id/checkins (EVT-F-030) > answers 404 for an unknown event
- PASS: rejected tickets (EVT-F-031) > rejects an unknown ticket with its own message
- PASS: rejected tickets (EVT-F-031) > rejects a ticket of another event with its own message
- PASS: rejected tickets (EVT-F-031) > rejects a ticket already used with its own message
- PASS: rejected tickets (EVT-F-031) > rejects a cancelled registration with its own message
- PASS: rejected tickets (EVT-F-031) > rejects a waitlisted registration with its own message
- PASS: rejected tickets (EVT-F-031) > refuses check-in for a cancelled event

### `backend/tests/errorHandler.test.js`

- PASS: standard error format > returns 404 in the standard format for an unknown route
- PASS: standard error format > returns 400 for a malformed JSON body
- PASS: standard error format > formats an AppError with its status and code
- PASS: standard error format > hides internal details for unexpected errors

### `backend/tests/events.test.js`

- PASS: POST /api/events (EVT-F-010, EVT-F-011) > lets an organizer create an event, which starts as DRAFT
- PASS: POST /api/events (EVT-F-010, EVT-F-011) > rejects invalid data with 400 and field details
- PASS: POST /api/events (EVT-F-010, EVT-F-011) > rejects a category that does not exist
- PASS: POST /api/events (EVT-F-010, EVT-F-011) > answers 403 when an attendee tries to create an event (EVT-F-005)
- PASS: POST /api/events (EVT-F-010, EVT-F-011) > answers 401 without a token
- PASS: POST /api/events/:id/publish (EVT-F-013) > publishes the organizer’s own draft
- PASS: POST /api/events/:id/publish (EVT-F-013) > refuses to publish another organizer’s event with 403
- PASS: POST /api/events/:id/publish (EVT-F-013) > refuses to publish an event that is not a draft with 409
- PASS: POST /api/events/:id/publish (EVT-F-013) > answers 404 for an unknown event
- PASS: GET /api/events/:id (draft visibility, EVT-F-013) > hides a draft from visitors with 404
- PASS: GET /api/events/:id (draft visibility, EVT-F-013) > shows a draft to its organizer
- PASS: GET /api/events/:id (draft visibility, EVT-F-013) > shows a published event to everyone
- PASS: GET /api/events/:id (draft visibility, EVT-F-013) > answers 404 for a non-numeric ID
- PASS: GET /api/events (EVT-F-016) > returns one page of 10 with the total
- PASS: GET /api/events (EVT-F-016) > rejects an invalid filter with 400
- PASS: GET /api/events/mine and /api/categories > lists the organizer’s own events
- PASS: GET /api/events/mine and /api/categories > lists categories for everyone

### `backend/tests/eventsManage.test.js`

- PASS: PUT /api/events/:id (EVT-F-012) > saves edits to the organizer’s own event
- PASS: PUT /api/events/:id (EVT-F-012) > fills new seats from the waitlist when the capacity grows (EVT-F-024)
- PASS: PUT /api/events/:id (EVT-F-012) > rejects a capacity below the confirmed registrations with 409
- PASS: PUT /api/events/:id (EVT-F-012) > refuses to edit another organizer’s event with 403
- PASS: PUT /api/events/:id (EVT-F-012) > rejects invalid data with 400
- PASS: PUT /api/events/:id (EVT-F-012) > refuses to edit a cancelled event with 409
- PASS: PUT /api/events/:id (EVT-F-012) > refuses to edit an event that has started with 409
- PASS: PUT /api/events/:id (EVT-F-012) > answers 404 for an unknown event
- PASS: POST /api/events/:id/cancel (EVT-F-014) > cancels the event and its registrations, audits it and notifies attendees
- PASS: POST /api/events/:id/cancel (EVT-F-014) > lets an admin cancel any event
- PASS: POST /api/events/:id/cancel (EVT-F-014) > refuses another organizer’s event with 403 and changes nothing
- PASS: POST /api/events/:id/cancel (EVT-F-014) > refuses to cancel twice with 409
- PASS: POST /api/events/:id/cancel (EVT-F-014) > refuses attendees with 403
- PASS: categories (EVT-F-015) > lets an admin add a category
- PASS: categories (EVT-F-015) > rejects a duplicate name with 409
- PASS: categories (EVT-F-015) > rejects an empty name with 400
- PASS: categories (EVT-F-015) > renames a category
- PASS: categories (EVT-F-015) > answers 404 when renaming an unknown category
- PASS: categories (EVT-F-015) > deletes an unused category
- PASS: categories (EVT-F-015) > refuses to delete a category in use with a message
- PASS: categories (EVT-F-015) > only admins can change categories

### `backend/tests/eventsValidation.test.js`

- PASS: event validation (EVT-F-011) > accepts a valid event
- PASS: event validation (EVT-F-011) > rejects an empty title
- PASS: event validation (EVT-F-011) > rejects a start that is not in the future
- PASS: event validation (EVT-F-011) > rejects an end before the start
- PASS: event validation (EVT-F-011) > rejects an end equal to the start
- PASS: event validation (EVT-F-011) > rejects capacity 0
- PASS: event validation (EVT-F-011) > rejects capacity 10001
- PASS: event validation (EVT-F-011) > rejects a decimal capacity
- PASS: event validation (EVT-F-011) > rejects a missing venue
- PASS: event validation (EVT-F-011) > rejects a missing category
- PASS: event validation (EVT-F-011) > rejects an invalid date
- PASS: event validation (EVT-F-011) > accepts capacity at the limits 1 and 10000
- PASS: search validation (EVT-F-016) > defaults to page 1
- PASS: search validation (EVT-F-016) > rejects a bad page and a bad date

### `backend/tests/health.test.js`

- PASS: GET /health > returns 200 when the database is reachable
- PASS: GET /health > returns 503 when the database is down
- PASS: GET /health > adds a request ID header to every response

### `backend/tests/logger.test.js`

- PASS: logger > writes one JSON line with timestamp, level and message
- PASS: logger > never writes passwords or tokens
- PASS: logger > writes errors to console.error

### `backend/tests/notifications.test.js`

- PASS: mailer > sends an email and returns true
- PASS: mailer > retries a failed email and succeeds on a later attempt
- PASS: mailer > gives up after 3 attempts without throwing
- PASS: notification emails (EVT-F-032, EVT-F-033) > includes the ticket ID in the confirmation email
- PASS: notification emails (EVT-F-032, EVT-F-033) > includes the waitlist position in the waitlist email
- PASS: notification emails (EVT-F-032, EVT-F-033) > builds the PROMOTED email
- PASS: notification emails (EVT-F-032, EVT-F-033) > builds the REGISTRATION_CANCELLED email
- PASS: notification emails (EVT-F-032, EVT-F-033) > builds the EVENT_CANCELLED email
- PASS: notification emails (EVT-F-032, EVT-F-033) > builds the REMINDER email
- PASS: notification emails (EVT-F-032, EVT-F-033) > rejects an unknown notification type
- PASS: notify (EVT-F-034) > saves an in-app notification and sends the email
- PASS: notify (EVT-F-034) > still sends the email when saving the in-app notification fails
- PASS: reminders (EVT-F-033) > sends one reminder per due registration
- PASS: reminders (EVT-F-033) > the scheduled job never throws
- PASS: notification API (EVT-F-034) > lists the user’s notifications with the unread count
- PASS: notification API (EVT-F-034) > marks the user’s own notification as read
- PASS: notification API (EVT-F-034) > refuses to mark another user’s notification with 403
- PASS: notification API (EVT-F-034) > answers 404 for an unknown notification
- PASS: notification API (EVT-F-034) > requires login

### `backend/tests/rateLimitConfig.test.js`

- PASS: rate limit settings (EVT-SR-007) > defaults to 100 API requests and 10 logins per minute

### `backend/tests/rateLimiter.test.js`

- PASS: rateLimiter (EVT-SR-007) > allows requests up to the limit
- PASS: rateLimiter (EVT-SR-007) > answers the request after the limit with 429 and the standard error format
- PASS: rateLimiter (EVT-SR-007) > sends rate limit headers

### `backend/tests/rbac.test.js`

- PASS: requireRole (EVT-F-005) > lets a user with an allowed role through
- PASS: requireRole (EVT-F-005) > answers 403 FORBIDDEN for a role that is not allowed
- PASS: requireRole (EVT-F-005) > answers 401 when nobody is logged in

### `backend/tests/registrations.test.js`

- PASS: POST /api/events/:id/registrations > confirms a seat with a ticket ID and emails the attendee (EVT-F-020)
- PASS: POST /api/events/:id/registrations > puts the attendee on the waitlist when the event is full (EVT-F-022)
- PASS: POST /api/events/:id/registrations > rejects a second active registration with 409 (EVT-F-021)
- PASS: POST /api/events/:id/registrations > turns a duplicate caught by the database into 409 as well
- PASS: POST /api/events/:id/registrations > refuses a draft event with 400 EVENT_NOT_OPEN
- PASS: POST /api/events/:id/registrations > refuses a cancelled event with 400 EVENT_NOT_OPEN
- PASS: POST /api/events/:id/registrations > refuses an event that has started with 400 EVENT_NOT_OPEN
- PASS: POST /api/events/:id/registrations > answers 404 for an unknown event
- PASS: POST /api/events/:id/registrations > answers 403 when an organizer tries to register (EVT-F-005)
- PASS: POST /api/events/:id/registrations > releases the database connection even after an error
- PASS: POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005) > cancels the attendee’s own registration and emails them
- PASS: POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005) > refuses to cancel another attendee’s registration with 403
- PASS: POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005) > refuses to cancel twice with 409
- PASS: POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005) > refuses to cancel after the event has started
- PASS: POST /api/registrations/:id/cancel (EVT-F-023, EVT-SR-005) > answers 404 for an unknown registration
- PASS: GET /api/registrations/me (EVT-F-025) > lists only the logged-in attendee’s registrations
- PASS: GET /api/registrations/me (EVT-F-025) > requires login
- PASS: waitlist promotion on cancel (EVT-F-024) > promotes the first waitlisted attendee when a confirmed seat is released
- PASS: waitlist promotion on cancel (EVT-F-024) > promotes nobody when no seat is free, but still renumbers the waitlist
- PASS: GET /api/registrations/:id/ticket (EVT-F-026) > returns the ticket with a QR code image of the ticket ID
- PASS: GET /api/registrations/:id/ticket (EVT-F-026) > refuses another attendee’s ticket with 403 (EVT-SR-005)
- PASS: GET /api/registrations/:id/ticket (EVT-F-026) > refuses a WAITLISTED registration with 409
- PASS: GET /api/registrations/:id/ticket (EVT-F-026) > refuses a CANCELLED registration with 409
- PASS: GET /api/registrations/:id/ticket (EVT-F-026) > answers 404 for an unknown registration
- PASS: GET /api/events/:id/registrations (EVT-F-027) > lists registrations with name, email, status and time for the organizer
- PASS: GET /api/events/:id/registrations (EVT-F-027) > refuses another organizer’s event with 403
- PASS: GET /api/events/:id/registrations (EVT-F-027) > refuses attendees with 403
- PASS: GET /api/events/:id/registrations (EVT-F-027) > answers 404 for an unknown event

### `backend/tests/reports.test.js`

- PASS: attendance report (EVT-F-035, TC-CHK-07) > gives 80% for 10 confirmed with 8 checked in
- PASS: attendance report (EVT-F-035, TC-CHK-07) > gives 0% when nobody is confirmed
- PASS: attendance report (EVT-F-035, TC-CHK-07) > rounds to one decimal place
- PASS: attendance report (EVT-F-035, TC-CHK-07) > returns the report to the organizer
- PASS: attendance report (EVT-F-035, TC-CHK-07) > refuses another organizer with 403 and unknown events with 404
- PASS: attendance report (EVT-F-035, TC-CHK-07) > refuses attendees with 403
- PASS: attendee CSV (EVT-F-036, TC-CHK-08) > has a header and one row per registration with the four columns
- PASS: attendee CSV (EVT-F-036, TC-CHK-08) > stops spreadsheet formulas in names (CSV injection)
- PASS: attendee CSV (EVT-F-036, TC-CHK-08) > downloads as a CSV file for the organizer
- PASS: attendee CSV (EVT-F-036, TC-CHK-08) > refuses another organizer with 403
- PASS: admin dashboard (EVT-F-037, TC-CHK-09) > returns totals by role, by event status and of registrations, with zeros filled in
- PASS: admin dashboard (EVT-F-037, TC-CHK-09) > is for admins only

### `backend/tests/schema.test.js`

- PASS: 001_init.sql schema > table users has all SAD columns
- PASS: 001_init.sql schema > table categories has all SAD columns
- PASS: 001_init.sql schema > table events has all SAD columns
- PASS: 001_init.sql schema > table registrations has all SAD columns
- PASS: 001_init.sql schema > table notifications has all SAD columns
- PASS: 001_init.sql schema > table audit_logs has all SAD columns
- PASS: 001_init.sql schema > table revoked_tokens has all SAD columns
- PASS: 001_init.sql schema > defines exactly the 7 tables from the SAD
- PASS: 001_init.sql schema > restricts statuses and roles to the documented values
- PASS: 001_init.sql schema > enforces capacity 1 to 10000 and end after start (EVT-F-011)
- PASS: 001_init.sql schema > allows one active registration per user and event (EVT-F-021)
- PASS: 001_init.sql schema > email and ticket_id are unique
- PASS: seed data > has the 7 standard test accounts from the Test Plan
- PASS: seed data > has at least one category

### `backend/tests/security.test.js`

- PASS: cleanText > removes control characters and trims, but keeps line breaks
- PASS: cleanText > turns non-text input into an empty string
- PASS: validation rejects bad types > rejects an object in place of a title
- PASS: validation rejects bad types > rejects a number written as text with SQL in it
- PASS: parameterized queries > passes a search keyword with SQL in it only as a parameter
- PASS: parameterized queries > stores a category name with SQL in it only as a parameter
- PASS: parameterized queries > answers 404 for an event ID that is not a number
- PASS: security headers > sends helmet headers on API responses

### `frontend/src/services/apiClient.test.js`

- PASS: apiRequest > returns the parsed JSON of a successful response
- PASS: apiRequest > sends the token in the Authorization header
- PASS: apiRequest > throws an error with status and code for a failed response

### `frontend/src/utils/events.test.js`

- PASS: validateEventForm > accepts a valid event
- PASS: validateEventForm > rejects an empty title and a start in the past
- PASS: validateEventForm > rejects an end before the start
- PASS: validateEventForm > rejects capacity outside 1 to 10000
- PASS: localInputToIso > converts a datetime-local value to ISO
- PASS: localInputToIso > returns an empty string for empty input
- PASS: seatsText > shows free seats or that the event is full
- PASS: isoToLocalInput > round-trips with localInputToIso
- PASS: isoToLocalInput > returns an empty string for missing or bad input
- PASS: canChangeEvent > allows changes before the start unless cancelled

### `frontend/src/utils/navLinks.test.js`

- PASS: getNavLinks > shows Login and Sign up to a visitor
- PASS: getNavLinks > shows organizer pages only to an organizer
- PASS: getNavLinks > shows the admin dashboard, users and categories only to an admin
- PASS: getNavLinks > treats an unknown role like a visitor
- PASS: homePathForRole > sends each role to its own dashboard

### `frontend/src/utils/notifications.test.js`

- PASS: notificationLabel > maps known types and falls back for unknown ones
- PASS: unreadText > shows the unread count in the navigation link

### `frontend/src/utils/registrations.test.js`

- PASS: statusLabel > shows the waitlist position
- PASS: statusLabel > shows readable labels
- PASS: canCancel > allows cancelling an active registration before the event
- PASS: canCancel > does not allow cancelling a cancelled registration or a started event
- PASS: registerResultMessage > shows the ticket ID or the waitlist position
- PASS: hasTicket > is true only for confirmed or checked-in registrations
- PASS: countByStatus > counts registrations per status

### `frontend/src/utils/reports.test.js`

- PASS: percentText > shows whole numbers without a decimal and others with one
- PASS: breakdown > lists counts in the given order with readable labels and zeros

### `frontend/src/utils/validation.test.js`

- PASS: validateSignUp > accepts valid details
- PASS: validateSignUp > rejects a short password
- PASS: validateSignUp > rejects a password without a digit
- PASS: validateSignUp > rejects an invalid email and an empty name
- PASS: fieldErrors > maps backend details to form fields
- PASS: validatePasswordChange > accepts a valid change
- PASS: validatePasswordChange > requires the current password and a matching, valid new one
