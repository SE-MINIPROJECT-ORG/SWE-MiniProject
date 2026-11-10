# Sprint 2 Review

**Sprint goal:** complete every remaining feature (waitlist promotion, tickets, check-in, reminders, notifications, reports, admin tools, event editing and cancellation, account lockout and profile), meet the non-functional and security requirements, and freeze development.

**Result:** goal met. All 24 Sprint 2 issues (81 story points) are closed. With Sprint 1, all 48 backlog issues (167 points) are done.

**Demo video (2 minutes):** [sprint2-demo.mp4](../videos/sprint2-demo.mp4)

## Completed issues

| Owner | Issues | Points |
|-------|--------|--------|
| Varun Rao | EVT-F-003, EVT-F-006, EVT-F-007, EVT-NF-001 | 16 |
| Thanishq Raam Patil | EVT-F-012, EVT-F-014, EVT-F-015, EVT-NF-002, EVT-NF-006, EVT-SR-003 | 21 |
| Vishruta | EVT-F-024, EVT-F-026, EVT-F-027, EVT-NF-003, EVT-NF-004, EVT-SR-004 | 21 |
| Nithin Kumar M | EVT-F-030, EVT-F-031, EVT-F-033, EVT-F-034, EVT-F-035, EVT-F-036, EVT-F-037, EVT-NF-005 | 23 |
| **Total** | **24 issues** | **81** |

Points per member over both sprints: Varun 41, Thanishq 42, Vishruta 41, Nithin 43.

## How the work was done

- Five pull requests over four days, in a fixed order because later features build on earlier ones: check-in and notifications (#80), tickets, waitlist promotion and HTTPS (#81), event editing and categories (#82), lockout and admin tools (#83), reports and dashboard (#84).
- Each pull request was raised by the issue owner, closed its backlog items with `Closes #n`, passed CI, and was approved by the next member in the review rotation before merging.
- GitHub Actions ran lint, unit tests and the frontend build on every pull request. From #84 the backend tests also enforce the 70% coverage gate (EVT-NF-005).

## Results at the end of the sprint

| Measure | Result |
|---------|--------|
| Backend unit tests | 205 passed, 0 failed |
| Frontend unit tests | 36 passed, 0 failed |
| Backend line coverage | 86.8% (target 70%) |
| Performance, 100 concurrent users (EVT-NF-001) | 95th percentile 141 ms, 100% within 2 s |
| 500 simultaneous registrations for 50 seats (EVT-NF-004) | 50 confirmed, 450 waitlisted, no overbooking |
| HTTPS (EVT-SR-004) | HTTP redirects to HTTPS; TLS 1.2 and 1.3 accepted; TLS 1.0 and 1.1 refused |

Details and how to repeat each measurement are in [docs/test-reports](../test-reports/).

## Verification

The complete system was started with `docker compose up --build` and checked by hand at https://localhost:8443:

1. An organizer created an event with 1 seat, published it and edited the venue.
2. One attendee registered and opened the ticket page with its QR code; a second attendee joined the waitlist.
3. The first attendee cancelled; the second was promoted to Confirmed automatically and saw the "Promoted" in-app notification and unread count.
4. The organizer checked the promoted attendee in by ticket ID; checking the same ticket again was refused as already used.
5. The organizer opened the registration list and the report (100% attendance), downloaded the attendee CSV, and cancelled the event.
6. The admin viewed the dashboard, changed a user's role, deactivated a user, added a category and was refused when deleting a category in use.
7. A user updated their phone number on the profile page.
8. Five wrong passwords locked an account; the correct password was then refused for 15 minutes.
9. http://localhost:8080 redirected to HTTPS, and MailHog showed the confirmation, waitlist, promotion, cancellation and reminder emails.

## Deviations from the submitted documents

| # | Document | What the document says | What was built | Reason |
|---|----------|------------------------|----------------|--------|
| 1 | SAD 2.1 and 3 (Presentation layer), risk R3 | The browser keeps the login token in memory, not in local storage | The token is kept in the browser's local storage until it expires | Keeping it only in memory logged users out on every page refresh, which made the app hard to use. The risk is limited by the 60-minute expiry, logout revoking the token on the server, React escaping all output, and the Content-Security-Policy header, which together block the script injection that could read the token. |
| 2 | SRS EVT-SR-004 | HTTPS with TLS 1.2 or higher | HTTPS through nginx at https://localhost:8443, with a self-signed certificate created when the image is built | The project runs on team laptops without a public domain, so no certificate authority can issue a certificate. The browser shows a one-time warning, but the connection is encrypted with TLS 1.2 or 1.3. A real deployment would use a certificate from a certificate authority. |
| 3 | SRS EVT-F-012, EVT-F-014, EVT-F-027, EVT-F-030, EVT-F-035, EVT-F-036 | The organizer of the event can edit, cancel, check in, and see registrations and reports | The same actions are also allowed for admins | Admins need to step in when an organizer is unavailable, for example to cancel an event. Other organizers and attendees are still refused with 403 (EVT-SR-005). |
| 4 | SRS EVT-F-033 | A reminder 24 hours before the start to every Confirmed attendee | The reminder job runs every minute and reminds every Confirmed attendee whose event starts within the next 24 hours, once each | An attendee who registers less than 24 hours before the start still gets a reminder, soon after registering. Each attendee is reminded only once (`reminder_sent_at`). |
| 5 | SRS EVT-F-035 | Report counts of Confirmed and Checked-in registrations and the attendance rate | "Confirmed" in the report counts everyone holding a seat, including those already checked in | A checked-in registration changes status from Confirmed to Checked in. Counting both gives the expected rate (10 confirmed, 8 checked in = 80%). |
| 6 | SRS EVT-F-006 | Admin changes roles and deactivates or reactivates accounts | An admin cannot change their own role or deactivate themselves (409), and reactivating an account also clears an account lock; both actions are audited | Stops the system from being left without an admin by mistake, and gives admins a way to unlock an account early. Status changes are logged as `ACCOUNT_STATUS_CHANGED` in addition to `ROLE_CHANGED` (EVT-SR-006). |
| 7 | SRS EVT-F-014 | Organizer cancels an event | An event can be cancelled or edited only before it starts | Changing an event that has already started would make check-in and reports inconsistent. |
| 8 | SRS EVT-NF-005 | 70% unit test coverage of backend code | The 70% gate covers the backend `src` code; test scripts (`backend/scripts`) and database scripts are excluded | The load, concurrency and uptime scripts are test tools run by hand, not application code. |

### Deviations recorded in Sprint 1

See the [Sprint 1 review](sprint-1-review.md): `bcryptjs` instead of `bcrypt`, required event category, nullable `audit_logs.user_id`, the extra waitlist email, ticket IDs for waitlisted registrations, configurable rate limits, and listing only upcoming events.

## Development freeze

Development is frozen from the merge of this review. Only documentation and test results are added after this point.
