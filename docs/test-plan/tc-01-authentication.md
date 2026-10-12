# Test Cases: F1 Authentication and Role Management

**Owner:** Varun Rao (PES1UG24CS520)
**Covers:** EVT-F-001 to EVT-F-007, EVT-NF-001, EVT-SR-001, EVT-SR-002

Actual Result and Result stay **Pending** until the test is run manually in Sprint 1 or Sprint 2. Fill both columns for every case before the final report.

Level in brackets: Unit (U), Integration (I) or System (S).

## Functional test cases (TC-AUTH)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | F1 Authentication (S) | Register with valid details (EVT-F-001) | Visitor is on the sign-up page; email not yet used | 1) Open sign-up; 2) Enter name, email, password and role; 3) Submit | Asha Rao, asha@test.com, Passw0rd1, role Attendee | Account is created, a success message is shown and the user can log in | Pending | Pending |
| TC-AUTH-02 | F1 Authentication (I) | Reject a duplicate email (EVT-F-001) | An account with asha@test.com exists | 1) Open sign-up; 2) Enter the same email with any other valid data; 3) Submit | asha@test.com, Passw0rd1 | Message "Email already registered" is shown and no second account is created | Pending | Pending |
| TC-AUTH-03 | F1 Authentication (S) | Log in with correct credentials (EVT-F-002) | Active account exists | 1) Open login; 2) Enter email and password; 3) Submit | asha@test.com, Passw0rd1 | A token valid for 60 minutes is issued and the role dashboard opens | Pending | Pending |
| TC-AUTH-04 | F1 Authentication (I) | Lock account after 5 failed attempts (EVT-F-003) | Active account exists and is not locked | 1) Submit a wrong password 5 times; 2) Submit the correct password (6th attempt); 3) Move the lock time back by 15 minutes (or wait) and log in again | asha@test.com, wrong password Wrong123 | 6th attempt is refused even with the correct password; login works after 15 minutes; the failures appear in the audit log | Pending | Pending |
| TC-AUTH-05 | F1 Authentication (I) | Log out invalidates the session (EVT-F-004) | User is logged in and holds a token | 1) Click log out; 2) Call a protected action with the old token | Token from TC-AUTH-03 | Old token is rejected with HTTP 401 | Pending | Pending |
| TC-AUTH-06 | F1 Authentication (I) | Role-based access is enforced (EVT-F-005) | Logged in as Attendee | 1) Attempt an Organizer-only action (create event); 2) Attempt an Admin-only action (open the user list) | Attendee token | Both actions return HTTP 403 and no data changes | Pending | Pending |
| TC-AUTH-07 | F1 Authentication (S) | Admin manages users (EVT-F-006) | Logged in as Admin; an Attendee account exists | 1) Open the user list; 2) Change the Attendee role to Organizer; 3) Deactivate the account and try to log in as that user; 4) Try to deactivate the admin's own account | Admin account, user asha@test.com | Role change applies at the user's next login; deactivated user cannot log in; self-deactivation is refused | Pending | Pending |
| TC-AUTH-08 | F1 Authentication (S) | Update profile and change password (EVT-F-007) | User is logged in | 1) Update name and phone; 2) Change password with the correct current password; 3) Change password with a wrong current password | Phone 9876543210, current Passw0rd1, new Newpass22 | Profile saved; correct current password allows the change; wrong one is rejected with an error | Pending | Pending |
| TC-AUTH-09 | F1 Authentication (I) | Reject wrong credentials without revealing which field is wrong (EVT-F-002) | Active account exists | 1) Login with a correct email and wrong password; 2) Login with an unknown email and any password | asha@test.com / Wrong123; nobody@test.com / Passw0rd1 | Both attempts show the same generic error and no token is issued | Pending | Pending |
| TC-AUTH-10 | F1 Authentication (U) | Reject invalid registration input (EVT-F-001) | Sign-up validation is available | 1) Submit with password shorter than 8 characters; 2) Submit a password with no digit; 3) Submit an invalid email format; 4) Submit with an empty name | abc12; Password; asha@; empty name | Each case is rejected with a specific message and no account is created | Pending | Pending |

## Non-functional test case (TC-NFR)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-NFR-01 | F1 Performance (S) | Response time under load (EVT-NF-001) | Reference test environment with seeded data | 1) Run a JMeter plan with 100 concurrent users on login, event list and registration calls for 5 minutes; 2) Read the 95th percentile response time | 100 virtual users, 5 min | 95th percentile is at or below 2 seconds | Pending | Pending |

## Security test cases (TC-SEC)

| Test Case ID | Module | Description | Pre-conditions | Steps | Test Data | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-01 | F1 Security (I) | Passwords are stored as bcrypt hashes (EVT-SR-001) | Account created in TC-AUTH-01 | 1) Inspect the password column in the database; 2) Search application logs and API responses for the password | asha@test.com, Passw0rd1 | Only a salted bcrypt hash with cost 10 or higher is stored; the plain password appears nowhere | Pending | Pending |
| TC-SEC-02 | F1 Security (I) | Invalid session tokens are rejected (EVT-SR-002) | Valid token available | 1) Call a protected action with a token with one character changed; 2) Call with an expired token; 3) Call with no token | Tampered, expired and missing token | Every call returns HTTP 401 | Pending | Pending |
