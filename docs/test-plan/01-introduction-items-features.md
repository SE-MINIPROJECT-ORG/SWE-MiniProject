# Software Test Plan (STP)

**Project:** Event Management System (EMS)
**Version:** 1.0
**Authors:** Varun Rao (PES1UG24CS520), Thanishq Raam Patil (PES1UG24CS502), Vishruta (PES1UG24CS538), Nithin Kumar M (PES1UG25CS829)
**Date:** 12-10-2026
**Status:** Draft

## 1. Introduction

**Purpose:** This document defines the test plan for the Event Management System (EMS) v1.0. It describes the objectives, scope, strategy, environment, schedule and responsibilities for testing, and links every test to a requirement in the SRS.

**Scope:** Testing covers the four features of EMS: authentication and role management, event creation and management, event registration and ticketing, and check-in, notifications and reports. It also covers the non-functional requirements (performance, reliability, usability, concurrency, maintainability, compatibility) and the security requirements of the SRS.

**References:** EMS SRS v1.0 (sections 4, 5.1, 6 and 8), EMS Software Architecture and Design Specification (in preparation), project guidelines and the IEEE test plan template.

**Definitions:**

| Term | Meaning |
|------|---------|
| EMS | Event Management System |
| SRS / SAD / STP / RTM | Software Requirements Specification / Software Architecture and Design Specification / Software Test Plan / Requirements Traceability Matrix |
| TC | Test case |
| FR / NFR / SR | Functional / Non-functional / Security requirement |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| UAT | User acceptance testing |

## 2. Test Items

- F1 Authentication and role management module (registration, login, lockout, logout, RBAC, user administration, profile)
- F2 Event management module (create, edit, publish, cancel, categories, browse, search and filter)
- F3 Registration and ticketing module (register, waitlist, cancel, promotion, tickets with QR code, registration lists)
- F4 Check-in, notifications and reports module (check-in, emails, reminders, in-app notifications, reports, CSV export, admin dashboard)
- React frontend, Node.js/Express REST API and PostgreSQL database as an integrated system

## 3. Features to be Tested

| Requirement ID | Feature | Test cases |
|----------------|---------|------------|
| EVT-F-001 | Register an account | TC-AUTH-01, 02, 10 |
| EVT-F-002 | Login with a 60-minute session token | TC-AUTH-03, 09 |
| EVT-F-003 | Account lockout after 5 failed logins | TC-AUTH-04 |
| EVT-F-004 | Logout invalidates the session | TC-AUTH-05 |
| EVT-F-005 | Role-based access control (HTTP 403) | TC-AUTH-06, TC-EVT-10 |
| EVT-F-006 | Admin user management | TC-AUTH-07 |
| EVT-F-007 | Profile and password change | TC-AUTH-08 |
| EVT-F-010 | Create event | TC-EVT-01, 10 |
| EVT-F-011 | Event data validation | TC-EVT-02, 03 |
| EVT-F-012 | Edit own event, capacity rule | TC-EVT-04 |
| EVT-F-013 | Publish event, Draft hidden | TC-EVT-05 |
| EVT-F-014 | Cancel event | TC-EVT-06 |
| EVT-F-015 | Category management | TC-EVT-07 |
| EVT-F-016 | Browse, search, filter, paginate | TC-EVT-08, 09 |
| EVT-F-020 | Register for an event | TC-REG-01, 02 |
| EVT-F-021 | No duplicate registration | TC-REG-03 |
| EVT-F-022 | Waitlist | TC-REG-04 |
| EVT-F-023 | Cancel own registration | TC-REG-05, 10 |
| EVT-F-024 | Automatic waitlist promotion | TC-REG-06 |
| EVT-F-025 | My registrations list | TC-REG-07 |
| EVT-F-026 | Ticket with QR code | TC-REG-08 |
| EVT-F-027 | Organizer registration list | TC-REG-09 |
| EVT-F-030 | Check-in | TC-CHK-01 |
| EVT-F-031 | Check-in rejection cases | TC-CHK-02, 03 |
| EVT-F-032 | Notification emails | TC-CHK-04 |
| EVT-F-033 | 24-hour reminder email | TC-CHK-05 |
| EVT-F-034 | In-app notifications | TC-CHK-06 |
| EVT-F-035 | Attendance report | TC-CHK-07, 10 |
| EVT-F-036 | CSV export | TC-CHK-08 |
| EVT-F-037 | Admin dashboard | TC-CHK-09 |
| EVT-NF-001 | 95% of requests within 2 s at 100 users | TC-NFR-01 |
| EVT-NF-002 | 99% monthly availability | TC-NFR-02 |
| EVT-NF-003 | Usability: 3 clicks, 360 px to 1920 px | TC-NFR-03 |
| EVT-NF-004 | No overbooking under 500 simultaneous attempts | TC-NFR-04 |
| EVT-NF-005 | 70% unit test coverage and quality gate | TC-NFR-05 |
| EVT-NF-006 | Browser compatibility | TC-NFR-06 |
| EVT-SR-001 to EVT-SR-007 | Security requirements | TC-SEC-01 to TC-SEC-07 (see section 5.1) |

## 4. Features Not to be Tested

- Online payments and paid ticketing (out of scope in the SRS)
- Venue booking and seat maps (out of scope)
- Native mobile applications (out of scope)
- Integration with third-party calendars or social networks (out of scope)
- Internal behaviour of the external SMTP email service (only that EMS hands over the correct email is tested; a mock mail server is used)
- Third-party libraries and framework internals (React, Express, PostgreSQL), which are assumed to be tested by their maintainers
