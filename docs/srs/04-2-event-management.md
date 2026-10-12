# 4.2 Event Creation and Management (Feature F2)

**Feature owner:** Thanishq Raam Patil (PES1UG24CS502)

**Description:** Lets organizers create, edit, publish and cancel events, lets admins maintain event categories, and lets all users browse, search and filter published events.

## Functional Requirements

| Req ID | Requirement | Type | Priority | Source / Stakeholder | Acceptance Criteria / Test Case Ref | Comments / Dependencies |
|--------|-------------|------|----------|----------------------|-------------------------------------|-------------------------|
| EVT-F-010 | The system shall allow an Organizer to create an event with title, description, category, venue, start date-time, end date-time and capacity. | Functional | High | Organizer | AC-EVT-F-010: Submitting all mandatory fields saves the event with status Draft and shows it in the organizer's event list. Test: TC-EVT-01 | Requires Organizer role (EVT-F-005) |
| EVT-F-011 | The system shall validate event data and reject an event whose title is empty, whose start is not in the future, whose end is not after the start, or whose capacity is not a whole number from 1 to 10000. | Functional | High | Organizer | AC-EVT-F-011: Each invalid case returns a specific error message and nothing is saved. Test: TC-EVT-02, TC-EVT-03 | Also enforces EVT-SR-003 |
| EVT-F-012 | The system shall allow an Organizer to edit only their own events, and shall refuse to reduce the capacity below the number of confirmed registrations. | Functional | High | Organizer | AC-EVT-F-012: Edits to own events are saved, a capacity below confirmed registrations is rejected, and editing another organizer's event gives HTTP 403. Test: TC-EVT-04 | Depends on F3 registration count |
| EVT-F-013 | The system shall allow an Organizer to publish a Draft event, after which it is visible to all users, and shall keep Draft events hidden from Attendees and Visitors. | Functional | High | Organizer | AC-EVT-F-013: A published event appears in public search, and a Draft does not. Test: TC-EVT-05 | |
| EVT-F-014 | The system shall allow an Organizer to cancel their own event, set its status to Cancelled and cancel all its registrations. | Functional | High | Organizer | AC-EVT-F-014: The event shows as Cancelled, every registration for it becomes Cancelled, and cancellation notifications are triggered (EVT-F-032). Test: TC-EVT-06 | Depends on EVT-F-032 |
| EVT-F-015 | The system shall allow an Admin to add, rename and delete event categories, and shall refuse to delete a category that is in use. | Functional | Medium | Admin | AC-EVT-F-015: A new category is selectable on the event form, and deleting a category with events is refused with a message. Test: TC-EVT-07 | |
| EVT-F-016 | The system shall allow any user to browse published events, search by keyword in title or description, and filter by category and date range, with results paginated at 10 per page. | Functional | High | Visitor, Attendee | AC-EVT-F-016: A keyword returns only matching published events, filters combine correctly, and page 2 shows the next 10 results. Test: TC-EVT-08, TC-EVT-09 | Cancelled events are shown with a Cancelled label |

## Non-Functional Requirements Owned by This Feature

| Req ID | Requirement | Category | Priority | Acceptance Criteria / Measurement |
|--------|-------------|----------|----------|-----------------------------------|
| EVT-NF-002 | The system shall be available at least 99% of each month, measured by health-check pings every minute, excluding announced maintenance. | Reliability | Medium | Uptime report shows 99% or higher. Test: TC-NFR-02 |
| EVT-NF-006 | The web interface shall work correctly on the latest two versions of Google Chrome, Mozilla Firefox and Microsoft Edge. | Compatibility | Medium | All acceptance tests pass on each listed browser. Test: TC-NFR-06 |

## Security Requirements Owned by This Feature

| Req ID | Requirement (shall...) | Type | Priority | Acceptance Criteria / Test Case Ref |
|--------|------------------------|------|----------|-------------------------------------|
| EVT-SR-003 | All user input shall be validated and sanitized on the server, and database access shall use parameterized queries, to prevent SQL injection and cross-site scripting. | Security | High | Injection strings such as `' OR 1=1 --` and `<script>` in any field are rejected or stored harmlessly. Test: TC-SEC-03 |
