# Test Plan Sections 5 and 6: Approach and Test Environment

**Author:** Thanishq Raam Patil (PES1UG24CS502)

## 5. Test Approach / Strategy

### 5.0 Test levels

| Level | What is tested | How |
|-------|----------------|-----|
| Unit | Validation rules, calculations (attendance rate, waitlist order), password and token helpers | Jest for the Node.js backend and React Testing Library for the frontend, run by GitHub Actions on every pull request. Target: at least 70% line coverage (EVT-NF-005) |
| Integration | REST API with the PostgreSQL test database, role checks, email hand-over to a mock SMTP server | Jest with Supertest and Postman collections |
| System | End-to-end flows through the web interface on the supported browsers | Manual execution of the test cases in tc-01 to tc-04, with screenshots |
| Acceptance | All acceptance criteria (AC-EVT-...) in the SRS and the exit criteria in SRS 6.1 | Manual walkthrough by the team at the end of Sprint 2 |

### 5.0.1 Test types

- **Functional testing:** every functional requirement has at least one test case, with both valid and invalid input.
- **Regression testing:** the automated unit and integration suites run in the CI pipeline on every pull request, and the manual smoke cases (TC-AUTH-03, TC-EVT-01, TC-REG-01, TC-CHK-01) are repeated before each sprint review.
- **Performance testing:** JMeter with 100 concurrent users (TC-NFR-01).
- **Concurrency testing:** a script sending 500 simultaneous registrations (TC-NFR-04).
- **Usability and responsive testing:** walkthrough with 5 users and layout checks at 360 px and 1920 px (TC-NFR-03).
- **Compatibility testing:** latest two versions of Chrome, Firefox and Edge (TC-NFR-06).
- **Security testing:** see section 5.1.

### 5.0.2 Test design techniques

- **Boundary value analysis:** event capacity 0, 1, 10000 and 10001; password length 7 and 8; lockout at the 5th and 6th failed login; rate limit at the 100th and 101st request.
- **Equivalence partitioning:** valid and invalid classes for email, dates, capacity, ticket status and user roles.
- **State-based testing:** registration status changes (Confirmed, Waitlisted, Cancelled, Checked-in) and event status changes (Draft, Published, Cancelled).
- **Error guessing:** double clicks, repeated submissions and expired sessions.

### 5.0.3 Defect severity

| Severity | Meaning | Example |
|----------|---------|---------|
| Critical | System unusable or data or security breach | Overbooking, login bypass |
| High | A main feature fails with no workaround | Registration cannot be confirmed |
| Medium | A feature fails but a workaround exists | Filter shows wrong page count |
| Low | Cosmetic or minor | Misaligned label |

### 5.0.4 Entry and exit criteria

**Entry criteria:** a stable build is deployed on the test environment, test data is loaded, the CI pipeline is green and the test cases for the feature are reviewed.

**Exit criteria** (from SRS 6.1): all High-priority requirements are implemented and verified; no critical or high-severity defect is open; all non-functional and security requirements meet their targets; every requirement is mapped to at least one passed test case in the RTM.

## 6. Test Environment

**Hardware:** team laptops (minimum 8 GB RAM) running the application locally, with phones or a browser window resized to 360 px for responsive checks.

**Software:**

| Item | Version or detail |
|------|-------------------|
| Operating system | Windows 10 or 11 (development); Linux with Docker for the CI pipeline |
| Node.js | LTS version used by the project |
| Database | PostgreSQL test database, reset with seed data before each run |
| Browsers | Latest two versions of Google Chrome, Mozilla Firefox and Microsoft Edge |
| Mock mail server | A local SMTP test server (for example MailHog) to read the emails EMS sends |

**Tools:**

| Purpose | Tool |
|---------|------|
| Unit and integration tests | Jest, Supertest, React Testing Library |
| API testing | Postman |
| Performance and concurrency | JMeter (or k6) |
| Security scanning | OWASP ZAP, a TLS scanner (SSL Labs or testssl.sh), npm audit |
| Static analysis and coverage | SonarQube |
| CI/CD | GitHub Actions |
| Defect and task tracking | GitHub Issues and GitHub Projects |

**Test data:** one Admin, two Organizers and at least six Attendee accounts; a set of Draft, Published and Cancelled events across several categories and dates; one event with capacity 2 for waitlist tests and one with capacity 100 for the concurrency test; 500 generated attendee accounts for TC-NFR-04. All data is dummy data.
