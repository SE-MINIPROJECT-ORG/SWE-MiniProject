# Test Plan Sections 5.1, 7, 8 and 9: Security Validation, Schedule, Deliverables, Roles

**Author:** Vishruta (PES1UG24CS538)

## 5.1 Security Validation

Security validation checks that the security requirements EVT-SR-001 to EVT-SR-007 and the objectives SO-1 to SO-3 in the SRS are met.

| Security check | Method and tool | Requirement | Test case |
|----------------|-----------------|-------------|-----------|
| Passwords are stored as salted bcrypt hashes and never logged | Database inspection and log review | EVT-SR-001 | TC-SEC-01 |
| Tokens expire after 60 minutes and tampered, expired or missing tokens are rejected | Manual API calls with Postman | EVT-SR-002 | TC-SEC-02 |
| Injection and script attacks in all input fields | Fuzzing with SQL injection and script strings and an OWASP ZAP scan | EVT-SR-003 | TC-SEC-03 |
| HTTPS with TLS 1.2 or higher, HTTP redirected | TLS scan with SSL Labs or testssl.sh | EVT-SR-004 | TC-SEC-04 |
| Users cannot read other users' registrations or tickets | Changing IDs in requests (access control test) | EVT-SR-005 | TC-SEC-05 |
| Security events are written to the audit log | Perform each action, inspect the log | EVT-SR-006 | TC-SEC-06 |
| Request and login rate limiting returns HTTP 429 | Script sending 101 requests and 11 logins per minute | EVT-SR-007 | TC-SEC-07 |
| Role-based access control (HTTP 403 for forbidden actions) | Negative tests for every role | EVT-F-005 | TC-AUTH-06, TC-EVT-10 |
| Vulnerable dependencies and secrets in the repository | npm audit, SonarQube analysis and a repository check for committed secrets | EVT-NF-005 | TC-NFR-05 |

**Penetration-style checks:** the authentication flow (login, lockout, token handling) is attacked by repeated login attempts, token modification and role escalation tries (an Attendee calling Organizer and Admin actions).

**Reporting:** every security defect is raised as a GitHub issue labelled `security` with severity, and a critical or high security defect blocks the release (see exit criteria).

## 7. Test Schedule

The schedule is expressed in project phases and sprints instead of calendar dates, so it stays valid if the faculty changes the dates.

| Milestone | Phase |
|-----------|-------|
| Test plan and test case design | Before Sprint 1 (this document) |
| Test environment and CI setup | Start of Sprint 1 |
| Sprint 1 test execution (first half of each feature) | Sprint 1 |
| Sprint 2 test execution and regression | Sprint 2 |
| Final results, Actual and Result columns completed, test summary | End of Sprint 2, before the code freeze |

## 8. Test Deliverables

- Test Plan (this document)
- Test cases with Actual Result and Result filled in (tc-01 to tc-04)
- Automated unit and integration test code and the coverage report
- Test data and seed scripts
- Test execution evidence (screenshots and logs)
- Defect reports (GitHub Issues)
- Security scan reports (OWASP ZAP and TLS scan)
- Test summary report

## 9. Roles and Responsibilities

| Role | Name | Responsibility |
|------|------|----------------|
| Test Lead | Varun Rao | Prepares and maintains the plan, assembles the traceability matrix and the test summary report |
| Test Engineer, F1 | Varun Rao | Designs and runs TC-AUTH, TC-NFR-01, TC-SEC-01, TC-SEC-02 |
| Test Engineer, F2 | Thanishq Raam Patil | Designs and runs TC-EVT, TC-NFR-02, TC-NFR-06, TC-SEC-03 |
| Test Engineer, F3 | Vishruta | Designs and runs TC-REG, TC-NFR-03, TC-NFR-04, TC-SEC-04, TC-SEC-05 |
| Test Engineer, F4 | Nithin Kumar M | Designs and runs TC-CHK, TC-NFR-05, TC-SEC-06, TC-SEC-07 |
| Repository owner and reviewer | Vishruta | Reviews and merges pull requests, owns the CI pipeline |
| Developer | Each member | Fixes defects found in their own feature |
| Approver | Course faculty | Approves the test results |
