# Test Cases: F4 Check-in, Notifications and Reports

**Owner:** Nithin Kumar M (PES1UG25CS829)
**Covers:** EVT-F-030 to EVT-F-037, EVT-NF-005, EVT-SR-006, EVT-SR-007

Actual Result and Result stay **Pending** until the test is run manually in Sprint 1 or Sprint 2. Fill both columns for every case before the final report.

Level in brackets: Unit (U), Integration (I) or System (S).

## Functional test cases (TC-CHK)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-CHK-01 | F4 Check-in, Notifications and Reports (S) | Check in a valid ticket (EVT-F-030) | Organizer owns the event; attendee has a Confirmed ticket | 1) Open the check-in screen; 2) Scan or type the ticket ID | Valid ticket ID | Ticket becomes Checked-in with a timestamp and the attendee name is shown | Pending | Pending |
| TC-CHK-02 | F4 Check-in, Notifications and Reports (I) | Reject an invalid, cancelled or waitlisted ticket (EVT-F-031) | Own event with a Cancelled and a Waitlisted registration | 1) Enter a ticket ID that does not exist; 2) Enter the Cancelled ticket; 3) Enter the Waitlisted ticket | Unknown ID, Cancelled ticket, Waitlisted ticket | Each case shows its own message and no check-in is recorded | Pending | Pending |
| TC-CHK-03 | F4 Check-in, Notifications and Reports (I) | Reject a used ticket or a ticket for another event (EVT-F-031) | A ticket already checked in; a ticket of a different event | 1) Check in the same ticket a second time; 2) Enter the other event's ticket | Used ticket, other-event ticket | Each case shows its own message and no new check-in is recorded | Pending | Pending |
| TC-CHK-04 | F4 Check-in, Notifications and Reports (I) | Emails for the four registration situations (EVT-F-032) | Mock SMTP service running; event and attendee exist | 1) Register (Confirmed); 2) Promote from the waitlist; 3) Cancel a registration; 4) Cancel the event | One attendee per situation | One email is sent for each situation, containing the event name and the new status | Pending | Pending |
| TC-CHK-05 | F4 Check-in, Notifications and Reports (I) | Reminder email 24 hours before the event (EVT-F-033) | Event starting in 24 hours with 3 Confirmed attendees and 1 Waitlisted attendee | 1) Run the scheduled reminder job; 2) Count the emails sent to each attendee | 3 Confirmed, 1 Waitlisted | Each Confirmed attendee gets exactly one reminder within plus or minus 5 minutes of the 24-hour mark and the Waitlisted attendee gets none | Pending | Pending |
| TC-CHK-06 | F4 Check-in, Notifications and Reports (S) | In-app notification list (EVT-F-034) | User has received a notification | 1) Open the notification list; 2) Mark one notification as read | Two notifications | New items appear as unread and change to read after marking; only the user's own notifications are shown | Pending | Pending |
| TC-CHK-07 | F4 Check-in, Notifications and Reports (I) | Attendance report (EVT-F-035) | Event with 10 Confirmed registrations, 8 of them checked in, 2 Waitlisted, 1 Cancelled | 1) Open the report as the event's Organizer | 10 Confirmed, 8 Checked-in | Counts are correct and the attendance rate shows 80% | Pending | Pending |
| TC-CHK-08 | F4 Check-in, Notifications and Reports (S) | CSV export of the attendee list (EVT-F-036) | Own event with registrations | 1) Click Export CSV; 2) Open the file in a spreadsheet | Event with 5 registrations | One row per registration with name, email, status and check-in time; a second organizer's export request is refused | Pending | Pending |
| TC-CHK-09 | F4 Check-in, Notifications and Reports (S) | Admin dashboard totals (EVT-F-037) | Logged in as Admin; test data in the database | 1) Open the dashboard; 2) Compare each total with a database count query | Users by role, events by status, registrations | All dashboard totals equal the database counts | Pending | Pending |
| TC-CHK-10 | F4 Check-in, Notifications and Reports (U) | Report with zero confirmed registrations (EVT-F-035) | Own event with no Confirmed registrations | 1) Open the report | Event with 0 Confirmed | Counts show 0 and the attendance rate shows 0% without an error or a division by zero | Pending | Pending |

## Non-functional test case (TC-NFR)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-NFR-05 | F4 Maintainability (S) | Unit test coverage and quality gate (EVT-NF-005) | CI pipeline is running on the backend | 1) Run the unit tests with a coverage report; 2) Run the SonarQube analysis | Backend unit test suite | Line coverage is at least 70% and the quality gate passes with no blocker or critical issues | Pending | Pending |

## Security test cases (TC-SEC)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-06 | F4 Security (I) | Audit log entries (EVT-SR-006) | Audit logging enabled | 1) Perform a login success and a login failure, a role change, an event cancellation and a check-in; 2) Open the audit log; 3) Search the log for passwords and tokens | One of each action | One correct entry (timestamp, user ID, action) exists for each action and no password or token appears in the log | Pending | Pending |
| TC-SEC-07 | F4 Security (I) | Rate limiting (EVT-SR-007) | Rate limiting enabled | 1) Send 101 API requests from one IP within a minute; 2) Send 11 login attempts within a minute | Request script from one IP | The 101st request and the 11th login attempt return HTTP 429 | Pending | Pending |
