# Design Overview, Data Model and Error Handling

**Section owner:** Vishruta (PES1UG24CS538)

## 4.1 Design Overview

### 4.1.1 Design Principles
- **Layered modules:** controllers call services, services call repositories, and no layer skips another.
- **One module per feature:** each feature has its own controller, service, repository and tests, so team members can work in parallel.
- **Thin controllers, rich services:** all business rules (seat limits, ownership, state changes) live in the service layer.
- **Transactions for shared state:** every change to registrations (register, cancel, promote) runs in one database transaction with the event row locked, which guarantees no overbooking (EVT-NF-004).
- **Fail safely:** every error goes through the central error handler, and no internal detail reaches the client.

### 4.1.2 Code Structure

```
backend/
  src/
    config/          environment and database setup
    middleware/      auth (JWT), rbac, rateLimiter, validate, errorHandler
    modules/
      auth/          controller, service, repository, routes
      events/        controller, service, repository, routes
      registrations/ controller, service, repository, routes
      checkin/       controller, service, routes
      reports/       controller, service, routes
      notifications/ controller, service, mailer, scheduler
    utils/           auditLogger, logger
  tests/             unit and integration tests per module
frontend/
  src/
    pages/           by role: public, attendee, organizer, admin
    components/      shared UI parts
    services/        API client
```

### 4.1.3 Data Model

| Table | Main columns | Notes |
|-------|--------------|-------|
| `users` | `id`, `name`, `email` (unique), `password_hash`, `phone`, `role` (ATTENDEE, ORGANIZER, ADMIN), `active`, `failed_attempts`, `locked_until`, `created_at` | Used by F1 |
| `categories` | `id`, `name` (unique) | Used by F2 |
| `events` | `id`, `organizer_id` (FK users), `category_id` (FK categories), `title`, `description`, `venue`, `start_time`, `end_time`, `capacity`, `status` (DRAFT, PUBLISHED, CANCELLED), `created_at` | Used by F2 |
| `registrations` | `id`, `event_id` (FK), `user_id` (FK), `status` (CONFIRMED, WAITLISTED, CANCELLED, CHECKED_IN), `ticket_id` (unique), `queue_position`, `created_at`, `checked_in_at`, `reminder_sent_at` | `reminder_sent_at` makes sure the 24-hour reminder is sent only once. Unique on (`event_id`, `user_id`) for active registrations. Used by F3 and F4. |
| `notifications` | `id`, `user_id` (FK), `type`, `message`, `read`, `created_at` | Used by F4 |
| `audit_logs` | `id`, `user_id`, `action`, `details`, `created_at` | Used by F1, F2 and F4 |
| `revoked_tokens` | `token_id`, `expires_at` | Holds logged-out tokens until they expire (EVT-F-004). Used by F1. |

Indexes: `events(status, start_time)`, `events(category_id)`, `registrations(event_id, status)` and `registrations(ticket_id)`, to support the 2-second response target (EVT-NF-001).

## 4.4 Error Handling, Logging and Monitoring

### 4.4.1 Standard Error Response

Every failed request returns this JSON structure:

```
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered",
    "details": []
  }
}
```

`details` carries field-level messages for validation errors, for example `[{ "field": "password", "message": "Must have at least 8 characters" }]`.

### 4.4.2 HTTP Status and Error Codes

| HTTP status | Error code | When it is used |
|-------------|------------|-----------------|
| 400 | `VALIDATION_ERROR` | Invalid or missing input |
| 400 | `EVENT_NOT_OPEN` | Registering for a draft, cancelled or started event |
| 401 | `UNAUTHORIZED` | Missing, expired, tampered or revoked token |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password (one message for both) |
| 403 | `FORBIDDEN` | Role not allowed, or the object belongs to someone else |
| 403 | `ACCOUNT_DEACTIVATED` | The account was deactivated by an admin |
| 404 | `NOT_FOUND` | Object does not exist (also used for unknown ticket IDs) |
| 409 | `EMAIL_EXISTS`, `ALREADY_REGISTERED`, `INVALID_STATE`, `TICKET_ALREADY_USED`, `CAPACITY_BELOW_CONFIRMED` | Conflict with the current state of the data |
| 423 | `ACCOUNT_LOCKED` | Account locked after 5 failed logins |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Unexpected failure. The client gets a generic message and a request ID. |

### 4.4.3 Handling Rules
- Errors are thrown by services as typed errors and converted by the central error handler, so controllers contain no `try/catch` formatting.
- Unexpected errors return HTTP 500 with a generic message. The stack trace is written only to the server log.
- A failed database transaction is rolled back before the error is returned.
- A failed email delivery never fails the user's request. The email is retried up to 3 times and the failure is logged.

### 4.4.4 Logging
- Structured JSON logs with timestamp, level (`error`, `warn`, `info`), request ID, user ID, route and status code.
- No passwords, tokens or full email bodies are ever logged (EVT-SR-001, EVT-SR-006).
- Security-relevant actions go to the separate audit log (EVT-SR-006).

### 4.4.5 Monitoring

| Item | How |
|------|-----|
| Availability | `GET /health` is checked every minute and returns the status of the API and database (EVT-NF-002) |
| Response time | The 95th percentile response time is measured in load tests (EVT-NF-001) |
| Error rate | Count of responses with status 5xx |
| Security signals | Failed logins, locked accounts and HTTP 429 responses taken from the audit log |
| Email health | Count of failed email deliveries |
