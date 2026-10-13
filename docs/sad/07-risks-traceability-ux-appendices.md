# Risks, Traceability, UX, Open Issues and Appendices

**Section owner:** Nithin Kumar M (PES1UG25CS829)

## 3.7 Risks and Mitigations

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R1 | Two attendees take the last seat at the same moment, leading to overbooking | High | Registration runs in a database transaction with the event row locked, verified by the 500-request concurrency test (TC-NFR-04) |
| R2 | The SMTP service is slow or down | Medium | Emails are sent asynchronously with up to 3 retries, and failures never block the user's request. In-app notifications still work. |
| R3 | A stolen or leaked token is misused | High | Short 60-minute expiry, HTTPS only, logout revokes the token, and the token is kept in memory in the browser |
| R4 | The database is lost or corrupted | High | Docker volume with regular backups, and a seed script to rebuild test data |
| R5 | The 2-second response target is missed as data grows | Medium | Indexes on event and registration lookups, paginated lists, and load tests in CI |
| R6 | Features owned by different members depend on each other (event cancel calls registration and notification) | Medium | Service interfaces are fixed in this document and each cross-module call is covered by an integration test |
| R7 | Delays in the semester schedule | Medium | Agile sprints with story points, with high-priority requirements built first |

## 3.8 Traceability to Requirements

Each requirement of the SRS maps to the component that realizes it, the API endpoint that exposes it and, where one exists, the sequence diagram that shows it. SD-1 is the login diagram, SD-2 the event cancellation diagram, SD-3 the registration diagram and SD-4 the check-in diagram. The test cases for each requirement are listed in the Test Plan (section 13).

| Requirement | Component(s) | API endpoint(s) | Sequence diagram |
|---|---|---|---|
| EVT-F-001 | Auth Module | POST /api/auth/register | - |
| EVT-F-002 | Auth Module | POST /api/auth/login | SD-1 |
| EVT-F-003 | Auth Module, Audit Logger | POST /api/auth/login | SD-1 |
| EVT-F-004 | Auth Module, Security Middleware | POST /api/auth/logout | - |
| EVT-F-005 | Security Middleware (RBAC) | All protected endpoints | - (enforced in the middleware before the controller) |
| EVT-F-006 | Auth Module | GET /api/users, PATCH /api/users/:id/role, PATCH /api/users/:id/status | - |
| EVT-F-007 | Auth Module | GET and PUT /api/users/me, PUT /api/users/me/password | - |
| EVT-F-010 | Event Module | POST /api/events | - |
| EVT-F-011 | Event Module, Security Middleware (validation) | POST /api/events, PUT /api/events/:id | - |
| EVT-F-012 | Event Module | PUT /api/events/:id | - |
| EVT-F-013 | Event Module | POST /api/events/:id/publish | - |
| EVT-F-014 | Event Module, Registration Module, Notification Module | POST /api/events/:id/cancel | SD-2 |
| EVT-F-015 | Event Module | /api/categories endpoints | - |
| EVT-F-016 | Event Module | GET /api/events, GET /api/events/:id | - |
| EVT-F-020 | Registration Module | POST /api/events/:id/registrations | SD-3 |
| EVT-F-021 | Registration Module | POST /api/events/:id/registrations | SD-3 |
| EVT-F-022 | Registration Module | POST /api/events/:id/registrations | SD-3 |
| EVT-F-023 | Registration Module | POST /api/registrations/:id/cancel | - |
| EVT-F-024 | Registration Module, Notification Module | POST /api/registrations/:id/cancel | - (see 3.4.4) |
| EVT-F-025 | Registration Module | GET /api/registrations/me | - |
| EVT-F-026 | Registration Module (TicketService) | GET /api/registrations/:id/ticket | - |
| EVT-F-027 | Registration Module | GET /api/events/:id/registrations | - |
| EVT-F-030 | Check-in Module | POST /api/events/:id/checkins | SD-4 |
| EVT-F-031 | Check-in Module | POST /api/events/:id/checkins | SD-4 |
| EVT-F-032 | Notification Module | Internal calls from Event and Registration modules | SD-2, SD-3 |
| EVT-F-033 | Notification Module, Scheduler | Internal scheduled job | - |
| EVT-F-034 | Notification Module | GET /api/notifications, PATCH /api/notifications/:id/read | - |
| EVT-F-035 | Reporting Module | GET /api/events/:id/report | - |
| EVT-F-036 | Reporting Module | GET /api/events/:id/attendees.csv | - |
| EVT-F-037 | Reporting Module | GET /api/admin/dashboard | - |
| EVT-NF-001 | All modules, database indexes | All endpoints | - |
| EVT-NF-002 | Deployment (Docker), health check | GET /health | - |
| EVT-NF-003 | React SPA | - | - |
| EVT-NF-004 | Registration Module (transaction with row lock) | POST /api/events/:id/registrations | SD-3 |
| EVT-NF-005 | CI pipeline, test suites, SonarQube | - | - |
| EVT-NF-006 | React SPA | - | - |
| EVT-SR-001 | Auth Module (bcrypt) | POST /api/auth/register, POST /api/auth/login | SD-1 |
| EVT-SR-002 | Security Middleware (JWT) | All protected endpoints | SD-1 |
| EVT-SR-003 | Security Middleware (validation), Repositories | All endpoints that accept input | - |
| EVT-SR-004 | Deployment (HTTPS reverse proxy) | All endpoints | - |
| EVT-SR-005 | Security Middleware, Registration and Event modules (ownership checks) | Registration and event endpoints | SD-2, SD-4 |
| EVT-SR-006 | Audit Logger (used by the Auth, Event and Check-in modules) | Login, role change, event cancel, check-in | SD-1, SD-2, SD-4 |
| EVT-SR-007 | Security Middleware (rate limiter) | All endpoints, strictest on login | - |

## 4.5 UX Design

### 4.5.1 Principles
- Show only what the user's role needs. The navigation bar changes for visitors, attendees, organizers and admins.
- Keep the main attendee task short: from an event page to a confirmed registration in 3 clicks or fewer (EVT-NF-003).
- Always show the status of a registration (Confirmed, Waitlisted, Cancelled) with text and colour.
- Give clear, specific error messages next to the field that caused them.

### 4.5.2 Main Screens

| Role | Screens |
|------|---------|
| Visitor | Home and event list with search and filters, event details, sign-up, login |
| Attendee | My registrations, ticket with QR code, notifications, profile |
| Organizer | My events, event form (create and edit), registration list, check-in screen, event report |
| Admin | User management, category management, dashboard |

### 4.5.3 Accessibility and Responsiveness
- Layouts work from 360 px to 1920 px wide with no horizontal scrolling.
- Keyboard navigation for all actions, labelled form fields, text alternatives for images and the QR code, and sufficient colour contrast.
- Check-in also works by typing the ticket ID, so a camera is not required.

## 4.6 Open Issues and Next Steps

| Item | Status |
|------|--------|
| Choice of the production SMTP provider | Open. A local mail catcher is used for development and testing. |
| Hosting target for the demo (local Docker or a cloud service) | Open |
| Online payments and paid tickets | Future enhancement, out of scope |
| Calendar integration and push notifications | Future enhancement |
| Native mobile applications | Future enhancement |

## 5. Appendices

### 5.1 Glossary

| Term | Meaning |
|------|---------|
| ADR | Architecture Decision Record |
| CI | Continuous Integration |
| EMS | Event Management System |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RTM | Requirements Traceability Matrix |
| SAD | Software Architecture and Design Specification |
| SMTP | Simple Mail Transfer Protocol |
| STRIDE | Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege |
| TLS | Transport Layer Security |
| Waitlist | First-in-first-out queue of attendees waiting for a seat |

### 5.2 References
IEEE 42010 (architecture description), OWASP Top 10 and OWASP ASVS, NIST SP 800-160, and the project's SRS and Test Plan.

### 5.3 Tools
Graphviz and draw.io for component diagrams, PlantUML for sequence diagrams, Postman and Swagger for API documentation, GitHub Projects for the backlog, SonarQube for static analysis.
