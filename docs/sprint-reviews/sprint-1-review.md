# Sprint 1 Review

**Sprint goal:** a working product where users can sign up and log in, organizers can create and publish events, and attendees can register, join a waitlist and cancel. Plus the project scaffold, database, CI and Docker setup.

**Result:** goal met. All 24 Sprint 1 issues (86 story points) are closed.

**Demo video (1 minute):** [sprint1-demo.mp4](../videos/sprint1-demo.mp4)

## Completed issues

| Owner | Issues | Points |
|-------|--------|--------|
| Varun Rao | S-01, EVT-F-001, EVT-F-002, EVT-F-004, EVT-F-005, EVT-SR-001, EVT-SR-002 | 25 |
| Thanishq Raam Patil | S-02, S-04, EVT-F-010, EVT-F-011, EVT-F-013, EVT-F-016 | 21 |
| Vishruta | EVT-F-020, EVT-F-021, EVT-F-022, EVT-F-023, EVT-F-025, EVT-SR-005 | 20 |
| Nithin Kumar M | S-03, S-05, EVT-F-032, EVT-SR-006, EVT-SR-007 | 20 |
| **Total** | **24 issues** | **86** |

## How the work was done

- Every change went through a pull request from the issue owner, with `Closes #n` linking it to its backlog items.
- Each pull request was reviewed and approved by a teammate before merging (review rotation in CONTRIBUTING.md).
- GitHub Actions ran lint, unit tests and the frontend build on every pull request. Branch protection on `main` requires a passing CI run and one approval.
- At the end of the sprint: 116 backend unit tests and 25 frontend unit tests pass, with about 86% backend line coverage (target 70%, EVT-NF-005).

## Verification

The full system was started with `docker compose up --build` and checked by hand:

1. A new attendee signed up and logged in.
2. `organizer1` created an event with capacity 1 (saved as Draft) and published it.
3. `attendee1` registered and received a ticket ID; the event then showed as full.
4. `attendee2` joined the waitlist at position 1.
5. `attendee2` cancelled the registration.
6. MailHog received the confirmation, waitlist and cancellation emails.

## Deviations from the submitted documents

These are the places where the Sprint 1 implementation differs from the SRS, SAD or Test Plan, and why.

| # | Document | What the document says | What was built | Reason |
|---|----------|------------------------|----------------|--------|
| 1 | SAD 4.2 (F1), EVT-SR-001 | Passwords hashed with bcrypt | The `bcryptjs` library is used | Pure JavaScript, so it installs on every team member's Windows machine and in Docker without native build tools. It produces standard bcrypt hashes with cost 10, so EVT-SR-001 is still met. |
| 2 | SAD 4.1.3, data model | `events.category_id` references `categories` | `category_id` is required (NOT NULL) | Every event must belong to a category for filtering (EVT-F-016), so an event without one is rejected. |
| 3 | SAD 4.1.3, data model | `audit_logs.user_id` | `user_id` can be empty, and `details` is stored as JSON | A failed login with an unknown email has no user to record, but must still be logged (EVT-SR-006). JSON keeps the details structured. |
| 4 | SRS EVT-F-032 | Emails on confirmation, promotion, cancellation and event cancellation | An email is also sent when an attendee joins the waitlist | Tells the attendee their waitlist position straight away. It is an addition and changes no existing behaviour. |
| 5 | SRS EVT-F-020, data model | A ticket ID for each confirmed registration | Waitlisted registrations also get a ticket ID when created | The `ticket_id` column is unique and required. The ticket page and check-in (Sprint 2) only accept Confirmed registrations, so a waitlisted ticket cannot be used. |
| 6 | SRS EVT-SR-007 | 100 API requests and 10 logins per minute per IP | Same limits, but they can be changed with `API_RATE_LIMIT` and `LOGIN_RATE_LIMIT` | Needed to raise the limit for the load and concurrency tests (EVT-NF-001, EVT-NF-004). The defaults match the SRS. |
| 7 | SRS EVT-F-016 | Browse published events | Only published events that have not started yet are listed | Past events cannot be registered for, so listing them would confuse attendees. |

### Planned for Sprint 2 (not deviations)

Account lockout (EVT-F-003), admin user management (EVT-F-006), profile and password change (EVT-F-007), editing and cancelling events (EVT-F-012, EVT-F-014), category management (EVT-F-015), waitlist promotion (EVT-F-024), tickets with QR codes (EVT-F-026), organizer registration lists (EVT-F-027), check-in, reminders, notifications, reports and the admin dashboard (EVT-F-030 to EVT-F-037), and the remaining non-functional and security items.
