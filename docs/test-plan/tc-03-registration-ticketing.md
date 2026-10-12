# Test Cases: F3 Event Registration and Ticketing

**Owner:** Vishruta (PES1UG24CS538)
**Covers:** EVT-F-020 to EVT-F-027, EVT-NF-003, EVT-NF-004, EVT-SR-004, EVT-SR-005

Actual Result and Result stay **Pending** until the test is run manually in Sprint 1 or Sprint 2. Fill both columns for every case before the final report.

Level in brackets: Unit (U), Integration (I) or System (S).

## Functional test cases (TC-REG)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-REG-01 | F3 Registration and Ticketing (S) | Register for an event with a free seat (EVT-F-020) | Published future event with free seats; logged in as Attendee | 1) Open the event; 2) Click Register | Event capacity 50, 10 registered | Registration is Confirmed, free seats drop by 1 and a unique ticket ID is shown | Pending | Pending |
| TC-REG-02 | F3 Registration and Ticketing (I) | Registration refused for Draft, Cancelled or started events (EVT-F-020) | A Draft event, a Cancelled event and an event whose start time has passed exist | 1) Try to register for each of the three events | Three events | Each attempt is refused with a message and no registration is created | Pending | Pending |
| TC-REG-03 | F3 Registration and Ticketing (I) | Prevent duplicate active registration (EVT-F-021) | Attendee already has a Confirmed or Waitlisted registration for the event | 1) Try to register again for the same event | Same attendee and event | Message "Already registered" is shown and no second registration is created | Pending | Pending |
| TC-REG-04 | F3 Registration and Ticketing (S) | Join the waitlist when the event is full (EVT-F-022) | Event has capacity 2 and 2 Confirmed registrations | 1) Register a third and then a fourth attendee | Attendees C and D | Both become Waitlisted, with positions 1 and 2 shown | Pending | Pending |
| TC-REG-05 | F3 Registration and Ticketing (S) | Cancel own registration (EVT-F-023) | Attendee has a Confirmed registration for a future event | 1) Open My registrations; 2) Cancel the registration; 3) Check the event's free seats | One Confirmed registration | Status becomes Cancelled and free seats increase by 1 | Pending | Pending |
| TC-REG-06 | F3 Registration and Ticketing (I) | Waitlist promotion in first-in-first-out order (EVT-F-024) | Full event with waitlist C (position 1) and D (position 2) | 1) A Confirmed attendee cancels; 2) Check statuses of C and D and the notifications | Waitlist C then D | C becomes Confirmed, D moves to position 1 and C is notified | Pending | Pending |
| TC-REG-07 | F3 Registration and Ticketing (S) | My registrations list (EVT-F-025) | Attendee has Confirmed, Waitlisted and Cancelled registrations; another attendee also has registrations | 1) Open My registrations | Three registrations of one attendee | Only this attendee's registrations are listed, each with event name, date and the correct status | Pending | Pending |
| TC-REG-08 | F3 Registration and Ticketing (S) | Ticket page with QR code (EVT-F-026) | Attendee has a Confirmed registration | 1) Open the ticket page; 2) Scan the QR code with a scanner or phone; 3) Open the ticket page of a Waitlisted registration | One Confirmed ticket | Ticket page shows ID, event details and QR code; the scan returns the same ticket ID; a Waitlisted registration has no ticket | Pending | Pending |
| TC-REG-09 | F3 Registration and Ticketing (S) | Organizer views the registration list (EVT-F-027) | Organizer owns an event with registrations; a second organizer exists | 1) Open the registration list of the own event; 2) As the second organizer try to open the same list | Event with 5 registrations | The list shows name, email, status and registration time; the other organizer is refused with HTTP 403 | Pending | Pending |
| TC-REG-10 | F3 Registration and Ticketing (I) | Cancel after the event has started is refused (EVT-F-023) | Attendee has a Confirmed registration for an event whose start time has passed | 1) Try to cancel the registration | Started event | Cancellation is refused with a message and the status stays Confirmed | Pending | Pending |

## Non-functional test cases (TC-NFR)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-NFR-03 | F3 Usability and Concurrency (S) | Usability and responsive layout (EVT-NF-003) | Published event and 5 test users | 1) Ask each user to register for an event starting from its details page and count the clicks; 2) Check every page at 360 px and 1920 px width | 5 users, widths 360 px and 1920 px | Registration needs at most 3 clicks and every page displays correctly at both widths | Pending | Pending |
| TC-NFR-04 | F3 Usability and Concurrency (I) | No overbooking under 500 simultaneous attempts (EVT-NF-004) | Event with capacity 100 and 500 test accounts | 1) Run a script that sends 500 simultaneous registration requests; 2) Count Confirmed registrations; 3) Repeat the run 3 times | Capacity 100, 500 accounts | Confirmed registrations never exceed 100 in any run and the extra attendees are Waitlisted | Pending | Pending |

## Security test cases (TC-SEC)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-04 | F3 Security (S) | HTTPS and TLS version (EVT-SR-004) | Application deployed on the test server | 1) Run a TLS scan (SSL Labs or testssl.sh); 2) Open the site over plain HTTP | Test server URL | No protocol below TLS 1.2 is offered and plain HTTP is redirected to HTTPS or refused | Pending | Pending |
| TC-SEC-05 | F3 Security (I) | Ownership checks on registrations and tickets (EVT-SR-005) | Attendee A and attendee B each hold a registration; organizer of another event exists | 1) As A request B's registration by ID; 2) As A request B's ticket by ID; 3) As an organizer request registrations of another organizer's event | IDs belonging to other users | Every request returns HTTP 403 and no data is returned | Pending | Pending |
