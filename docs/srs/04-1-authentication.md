# 4.1 Authentication and Role Management (Feature F1)

**Feature owner:** Varun Rao (PES1UG24CS520)

**Description:** Allows visitors to create accounts and log in, enforces role-based access for Attendees, Organizers and Admins, and lets users and admins manage accounts.

## Functional Requirements

| Req ID | Requirement | Type | Priority | Source / Stakeholder | Acceptance Criteria / Test Case Ref | Comments / Dependencies |
|--------|-------------|------|----------|----------------------|-------------------------------------|-------------------------|
| EVT-F-001 | The system shall allow a visitor to register an account by providing name, email, password and role (Attendee or Organizer). | Functional | High | Visitor | AC-EVT-F-001: A valid form creates the account, and an existing email is rejected with the message "Email already registered". Test: TC-AUTH-01, TC-AUTH-02 | Password must have at least 8 characters with a letter and a digit |
| EVT-F-002 | The system shall authenticate a user with email and password and issue a session token valid for 60 minutes. | Functional | High | All users | AC-EVT-F-002: Correct credentials return a token and open the role dashboard, and wrong credentials return an error without revealing which field was wrong. Test: TC-AUTH-03 | Depends on EVT-F-001 and EVT-SR-002 |
| EVT-F-003 | The system shall lock an account for 15 minutes after 5 consecutive failed login attempts. | Functional | High | Security | AC-EVT-F-003: The 6th attempt within the lock period is refused even with the correct password, and login works again after 15 minutes. Test: TC-AUTH-04 | Failed attempts are recorded in the audit log (EVT-SR-006) |
| EVT-F-004 | The system shall allow a logged-in user to log out, which invalidates the session. | Functional | Medium | All users | AC-EVT-F-004: After logout the old token is rejected with HTTP 401. Test: TC-AUTH-05 | |
| EVT-F-005 | The system shall restrict every feature to the roles permitted to use it and respond with HTTP 403 when a user lacks permission. | Functional | High | Security | AC-EVT-F-005: An Attendee calling an Organizer-only or Admin-only action receives HTTP 403 and no data change occurs. Test: TC-AUTH-06 | Applies to all features |
| EVT-F-006 | The system shall allow an Admin to view all users, change a user's role, and deactivate or reactivate an account. | Functional | Medium | Admin | AC-EVT-F-006: A deactivated user cannot log in, and a role change takes effect on the user's next login. Test: TC-AUTH-07 | An Admin cannot deactivate their own account |
| EVT-F-007 | The system shall allow a user to view and update their name and phone number and to change their password by supplying the current password. | Functional | Low | All users | AC-EVT-F-007: A correct current password allows the change, and a wrong one is rejected. Test: TC-AUTH-08 | |

## Non-Functional Requirements Owned by This Feature

| Req ID | Requirement | Category | Priority | Acceptance Criteria / Measurement |
|--------|-------------|----------|----------|-----------------------------------|
| EVT-NF-001 | At least 95% of API requests shall complete within 2 seconds with 100 concurrent users on the reference test environment. | Performance | High | Load test report shows the 95th percentile at or below 2 s. Test: TC-NFR-01 |

## Security Requirements Owned by This Feature

| Req ID | Requirement (shall...) | Type | Priority | Acceptance Criteria / Test Case Ref |
|--------|------------------------|------|----------|-------------------------------------|
| EVT-SR-001 | Passwords shall be stored only as salted bcrypt hashes (cost factor 10 or higher) and shall never appear in logs or API responses. | Security | High | Database inspection shows no plaintext password, and log review finds none. Test: TC-SEC-01 |
| EVT-SR-002 | Session tokens shall be signed JWTs that expire after 60 minutes, and expired, tampered or missing tokens shall be rejected with HTTP 401. | Security | High | A modified or expired token gets HTTP 401. Test: TC-SEC-02 |
