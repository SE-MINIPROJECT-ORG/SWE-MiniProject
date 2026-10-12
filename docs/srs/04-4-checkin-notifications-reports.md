# 4.4 Attendance Check-in, Notifications and Reports (Feature F4)

**Feature owner:** Nithin Kumar M (PES1UG25CS829)

**Description:** Lets organizers check attendees in with their tickets, sends email and in-app notifications for key events, and provides attendance reports, CSV export and an admin dashboard.

## Functional Requirements

| Req ID | Requirement | Type | Priority | Source / Stakeholder | Acceptance Criteria / Test Case Ref | Comments / Dependencies |
|--------|-------------|------|----------|----------------------|-------------------------------------|-------------------------|
| EVT-F-030 | The system shall allow an Organizer to check in an attendee for their own event by scanning or entering the ticket ID, and shall record the check-in time. | Functional | High | Organizer | AC-EVT-F-030: A valid Confirmed ticket becomes Checked-in with a timestamp and the screen shows the attendee name. Test: TC-CHK-01 | Uses the ticket from EVT-F-026 |
| EVT-F-031 | The system shall reject a check-in for a ticket that is invalid, Cancelled, Waitlisted, already used, or belongs to a different event, with a specific message for each case. | Functional | High | Organizer | AC-EVT-F-031: Each of the five cases shows its own message and no check-in is recorded. Test: TC-CHK-02, TC-CHK-03 | |
| EVT-F-032 | The system shall send an email to the attendee when their registration is confirmed, when they are promoted from the waitlist, when they cancel, and when the event is cancelled. | Functional | High | Attendee | AC-EVT-F-032: Each of the four situations sends one email with the event name and the new status. Test: TC-CHK-04 | Triggered by EVT-F-014, EVT-F-020, EVT-F-023 and EVT-F-024 |
| EVT-F-033 | The system shall send a reminder email 24 hours before the start of an event to every Confirmed attendee. | Functional | Medium | Attendee | AC-EVT-F-033: Each Confirmed attendee gets exactly one reminder 24 hours (plus or minus 5 minutes) before the start. Test: TC-CHK-05 | Uses a scheduled job |
| EVT-F-034 | The system shall show each user an in-app notification list that records the notifications sent to them and lets them mark notifications as read. | Functional | Low | Attendee | AC-EVT-F-034: New notifications appear as unread and change to read when marked. Test: TC-CHK-06 | |
| EVT-F-035 | The system shall give an Organizer a report for each of their events showing counts of Confirmed, Waitlisted, Cancelled and Checked-in registrations and the attendance rate (checked-in divided by confirmed, as a percentage). | Functional | High | Organizer | AC-EVT-F-035: For 10 confirmed registrations with 8 checked in, the attendance rate shows 80%. Test: TC-CHK-07 | |
| EVT-F-036 | The system shall allow an Organizer to export the attendee list of their own event as a CSV file with name, email, status and check-in time. | Functional | Medium | Organizer | AC-EVT-F-036: The downloaded CSV opens correctly and has one row per registration with the four columns. Test: TC-CHK-08 | |
| EVT-F-037 | The system shall give an Admin a dashboard showing total users by role, total events by status and total registrations. | Functional | Low | Admin | AC-EVT-F-037: The dashboard totals match the database counts. Test: TC-CHK-09 | |

## Non-Functional Requirements Owned by This Feature

| Req ID | Requirement | Category | Priority | Acceptance Criteria / Measurement |
|--------|-------------|----------|----------|-----------------------------------|
| EVT-NF-005 | The backend code shall reach at least 70% unit test line coverage and pass the static-analysis quality gate with no blocker or critical issues before each release. | Maintainability | Medium | Coverage report shows 70% or higher and the SonarQube quality gate passes. Test: TC-NFR-05 |

## Security Requirements Owned by This Feature

| Req ID | Requirement (shall...) | Type | Priority | Acceptance Criteria / Test Case Ref |
|--------|------------------------|------|----------|-------------------------------------|
| EVT-SR-006 | The system shall record an audit log entry with timestamp, user ID and action for every login success or failure, role change, event cancellation and check-in, and the log shall never contain passwords or tokens. | Security | High | Performing each listed action creates one correct log entry, and a log search finds no passwords or tokens. Test: TC-SEC-06 |
| EVT-SR-007 | The system shall limit each IP address to 100 API requests per minute and to 10 login attempts per minute, and shall answer excess requests with HTTP 429. | Security | Medium | The 101st request in a minute returns HTTP 429. Test: TC-SEC-07 |
