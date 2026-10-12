# 4.3 Event Registration and Ticketing (Feature F3)

**Feature owner:** Vishruta (PES1UG24CS538)

**Description:** Lets attendees register for published events, joins them to a waitlist when an event is full, handles cancellations with automatic waitlist promotion, and provides tickets with QR codes.

## Functional Requirements

| Req ID | Requirement | Type | Priority | Source / Stakeholder | Acceptance Criteria / Test Case Ref | Comments / Dependencies |
|--------|-------------|------|----------|----------------------|-------------------------------------|-------------------------|
| EVT-F-020 | The system shall allow a logged-in Attendee to register for a published event that has not started and has a free seat, and shall create a confirmed registration with a unique ticket ID. | Functional | High | Attendee | AC-EVT-F-020: The registration is Confirmed, the seat count drops by 1, and a unique ticket ID is shown. Registering for a Draft, Cancelled or started event is refused. Test: TC-REG-01, TC-REG-02 | Depends on EVT-F-013 |
| EVT-F-021 | The system shall prevent an Attendee from holding more than one active registration (Confirmed or Waitlisted) for the same event. | Functional | High | Organizer | AC-EVT-F-021: A second registration attempt is rejected with the message "Already registered". Test: TC-REG-03 | |
| EVT-F-022 | The system shall add an Attendee to a first-in-first-out waitlist when the event has no free seats. | Functional | High | Attendee, Organizer | AC-EVT-F-022: The registration status is Waitlisted and the waitlist position is shown. Test: TC-REG-04 | |
| EVT-F-023 | The system shall allow an Attendee to cancel their own registration before the event starts and shall release the seat. | Functional | High | Attendee | AC-EVT-F-023: The status becomes Cancelled and the free seat count increases by 1. Cancelling after the start time is refused. Test: TC-REG-05 | |
| EVT-F-024 | The system shall automatically promote the first Waitlisted Attendee to Confirmed when a seat is released and shall notify them. | Functional | High | Attendee | AC-EVT-F-024: The first waitlisted attendee becomes Confirmed, the next one moves up, and a notification is triggered (EVT-F-032). Test: TC-REG-06 | Depends on EVT-F-032 |
| EVT-F-025 | The system shall show an Attendee a list of their registrations with event name, date and status (Confirmed, Waitlisted, Cancelled). | Functional | Medium | Attendee | AC-EVT-F-025: The list shows only the logged-in attendee's registrations, each with the correct status. Test: TC-REG-07 | See EVT-SR-005 |
| EVT-F-026 | The system shall provide for each Confirmed registration a ticket page showing the ticket ID, event details and a QR code that encodes the ticket ID. | Functional | Medium | Attendee | AC-EVT-F-026: Scanning the QR code returns the ticket ID shown on the page. Test: TC-REG-08 | Used by check-in (EVT-F-030) |
| EVT-F-027 | The system shall allow an Organizer to view the list of registrations (Confirmed, Waitlisted, Cancelled) for their own events. | Functional | Medium | Organizer | AC-EVT-F-027: The list shows attendee name, email, status and registration time, and is refused for another organizer's event. Test: TC-REG-09 | |

## Non-Functional Requirements Owned by This Feature

| Req ID | Requirement | Category | Priority | Acceptance Criteria / Measurement |
|--------|-------------|----------|----------|-----------------------------------|
| EVT-NF-003 | A new Attendee shall be able to register for an event in no more than 3 clicks after opening its details page, and every page shall display correctly at screen widths from 360 px to 1920 px. | Usability | Medium | Usability walkthrough with 5 users and layout checks at 360 px and 1920 px. Test: TC-NFR-03 |
| EVT-NF-004 | Under 500 simultaneous registration attempts for an event, the system shall never confirm more registrations than the event capacity. | Scalability / Correctness | High | Concurrency test finds confirmed registrations less than or equal to capacity in every run. Test: TC-NFR-04 |

## Security Requirements Owned by This Feature

| Req ID | Requirement (shall...) | Type | Priority | Acceptance Criteria / Test Case Ref |
|--------|------------------------|------|----------|-------------------------------------|
| EVT-SR-004 | All communication between the browser and the server shall use HTTPS with TLS 1.2 or higher, and plain HTTP requests shall be redirected or refused. | Security | High | A TLS scan shows no protocol below 1.2 and an HTTP request is redirected. Test: TC-SEC-04 |
| EVT-SR-005 | The system shall enforce ownership checks so that an Attendee can access only their own registrations and tickets, and an Organizer only the registrations of their own events. | Security | High | Requesting another user's registration or ticket by ID returns HTTP 403. Test: TC-SEC-05 |
