# 3.9 Security Architecture

**Section owner:** Thanishq Raam Patil (PES1UG24CS502)

This section shows how the architecture meets the security objectives SO-1 (Confidentiality), SO-2 (Integrity) and SO-3 (Accountability and Availability) and the security requirements EVT-SR-001 to EVT-SR-007 of the SRS.

## 3.9.1 Trust Boundaries

| Boundary | Between | Controls |
|----------|---------|----------|
| TB-1 | Browser and API | HTTPS with TLS 1.2 or higher, JWT authentication, rate limiting, input validation |
| TB-2 | API and database | Parameterized queries only, a least-privilege database account, credentials in environment variables |
| TB-3 | API and email service | Credentials in environment variables, TLS to the SMTP server, no sensitive data in email bodies |

## 3.9.2 Threat Modeling (STRIDE)

| Threat | Example in EMS | Mitigation in the architecture | Requirement |
|--------|----------------|--------------------------------|-------------|
| **S**poofing | Someone logs in as another user or forges a token | bcrypt password hashes, signed JWTs with a 60-minute expiry, account lockout after 5 failed logins, same error message for wrong password and unknown email | EVT-SR-001, EVT-SR-002, EVT-F-003 |
| **T**ampering | Modified request data, SQL injection, altered token | Server-side validation and sanitization, parameterized queries, TLS in transit, signature check on every token | EVT-SR-003, EVT-SR-004, EVT-SR-002 |
| **R**epudiation | A user denies cancelling an event or a role change | Audit log with timestamp, user ID and action for security-relevant actions | EVT-SR-006 |
| **I**nformation disclosure | Reading another attendee's ticket, passwords in logs, stack traces in errors | Ownership checks on every object, TLS, hashed passwords, no secrets in logs, generic error messages | EVT-SR-005, EVT-SR-004, EVT-SR-001 |
| **D**enial of service | Flooding login or search endpoints | Rate limiting per IP (100 requests per minute, 10 login attempts per minute) with HTTP 429, paginated lists, request size limits | EVT-SR-007 |
| **E**levation of privilege | An attendee calls an organizer or admin endpoint | Role-based access control in the Security Middleware, object-level ownership checks, role stored on the server side and re-read at login | EVT-F-005, EVT-SR-005 |

## 3.9.3 Security Controls by Layer

| Layer | Controls |
|-------|----------|
| Presentation | The token is kept in memory (not local storage), output is escaped by React, no secrets in the frontend bundle |
| API | Security Middleware in a fixed order: rate limiter, JWT check, RBAC, input validation. A central error handler returns generic messages. |
| Service | Ownership and state checks in every service method, and transactions for registration changes |
| Data | Parameterized queries only, unique constraint on email, and no plaintext secrets in any table |
| Operations | Secrets only in environment variables, `.env` files git-ignored, `npm audit` and SonarQube in CI, HTTPS enforced by the reverse proxy |

## 3.9.4 Data Protection

| Data | Protection |
|------|------------|
| Passwords | Salted bcrypt hash, cost factor 10 or higher, never returned or logged |
| Personal data (name, email, phone) | Shown only to the owner, to the organizer of an event the person registered for, and to admins |
| Tokens | Signed, short-lived, never logged |
| Audit logs | Contain user ID, action and timestamp only, with no passwords or tokens |
