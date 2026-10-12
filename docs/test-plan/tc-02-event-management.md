# Test Cases: F2 Event Creation and Management

**Owner:** Thanishq Raam Patil (PES1UG24CS502)
**Covers:** EVT-F-010 to EVT-F-016, EVT-NF-002, EVT-NF-006, EVT-SR-003

Actual Result and Result stay **Pending** until the test is run manually in Sprint 1 or Sprint 2. Fill both columns for every case before the final report.

Level in brackets: Unit (U), Integration (I) or System (S).

## Functional test cases (TC-EVT)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-EVT-01 | F2 Event Management (S) | Create an event with valid data (EVT-F-010) | Logged in as Organizer | 1) Open the event form; 2) Fill every mandatory field; 3) Save | Title Tech Fest, category Technical, venue Hall A, start in 7 days, end 2 hours later, capacity 50 | Event is saved with status Draft and appears in the organizer's event list | Pending | Pending |
| TC-EVT-02 | F2 Event Management (U) | Reject invalid title and dates (EVT-F-011) | Logged in as Organizer | 1) Save with an empty title; 2) Save with a start date in the past; 3) Save with an end date before the start | Empty title; start yesterday; end earlier than start | Each case shows its own error and nothing is saved | Pending | Pending |
| TC-EVT-03 | F2 Event Management (U) | Reject invalid capacity (EVT-F-011) | Logged in as Organizer | 1) Save with capacity 0; 2) Save with capacity 10001; 3) Save with capacity 5.5; 4) Save with capacity abc; 5) Save with capacity 1 and capacity 10000 | 0, 10001, 5.5, abc, then 1 and 10000 | The first four are rejected with an error; the boundary values 1 and 10000 are accepted | Pending | Pending |
| TC-EVT-04 | F2 Event Management (I) | Edit own event and enforce capacity rule (EVT-F-012) | Own event with capacity 50 and 20 confirmed registrations; a second organizer exists | 1) Change the venue and save; 2) Reduce capacity to 10; 3) Reduce capacity to 25; 4) As the second organizer edit the first organizer's event | Capacity 10 then 25 | Venue change saved; capacity 10 rejected; capacity 25 saved; the other organizer gets HTTP 403 | Pending | Pending |
| TC-EVT-05 | F2 Event Management (S) | Publish makes an event public, Draft stays hidden (EVT-F-013) | One Draft event exists | 1) Search for the event as Visitor and as Attendee; 2) Publish it as Organizer; 3) Search again | Event Tech Fest | Draft is not visible to Visitor or Attendee; after publishing it appears in public search | Pending | Pending |
| TC-EVT-06 | F2 Event Management (I) | Cancel an event cancels its registrations (EVT-F-014) | Published own event with 3 Confirmed registrations | 1) Cancel the event as Organizer; 2) Open the event and each registration | Event with 3 registrations | Event shows Cancelled, all 3 registrations become Cancelled and cancellation notifications are triggered | Pending | Pending |
| TC-EVT-07 | F2 Event Management (S) | Admin manages categories (EVT-F-015) | Logged in as Admin; a category used by an event exists | 1) Add category Workshop; 2) Rename it to Workshops; 3) Check it on the event form; 4) Delete a category that is in use; 5) Delete an unused category | Workshop, Workshops, category Technical in use | New category is selectable; deleting a category in use is refused with a message; unused one is deleted | Pending | Pending |
| TC-EVT-08 | F2 Event Management (S) | Search published events by keyword (EVT-F-016) | Several published events and one Draft exist | 1) Search for a keyword in a title; 2) Search for a keyword in a description; 3) Search for a keyword that matches nothing | Keywords tech, coding, zzzz | Only matching published events are shown; no match shows an empty-result message; the Draft never appears | Pending | Pending |
| TC-EVT-09 | F2 Event Management (S) | Filter and paginate results (EVT-F-016) | More than 10 published events across categories and dates | 1) Filter by category; 2) Add a date range filter; 3) Clear filters and open page 2 | Category Technical, one month range | Filters combine correctly, each page has at most 10 events and page 2 shows the next ones; a Cancelled event is labelled Cancelled | Pending | Pending |
| TC-EVT-10 | F2 Event Management (I) | Attendee cannot create or publish events (EVT-F-010, EVT-F-005) | Logged in as Attendee | 1) Attempt to create an event; 2) Attempt to publish an event | Attendee token | Both are refused with HTTP 403 and nothing is saved | Pending | Pending |

## Non-functional test cases (TC-NFR)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-NFR-02 | F2 Reliability and Compatibility (S) | Monthly availability (EVT-NF-002) | Health-check pinging every minute is set up | 1) Collect health-check results for the test period; 2) Calculate uptime excluding announced maintenance | Health check every 1 minute | Uptime is 99% or higher | Pending | Pending |
| TC-NFR-06 | F2 Reliability and Compatibility (S) | Browser compatibility (EVT-NF-006) | Latest two versions of Chrome, Firefox and Edge installed | 1) Run the main flows (login, create event, search, register) in each browser | All three browsers | All acceptance tests pass on each browser with no layout or functional defect | Pending | Pending |

## Security test case (TC-SEC)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-03 | F2 Security (I) | Input is validated and queries are parameterized (EVT-SR-003) | Logged in as Organizer | 1) Enter ' OR 1=1 -- in login, search and event title fields; 2) Enter <script>alert(1)</script> in title and description; 3) View the saved event page | ' OR 1=1 --; <script>alert(1)</script> | Injection strings are rejected or stored harmlessly; no script runs and no extra data is returned | Pending | Pending |
