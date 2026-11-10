# System Validation Report

**Build tested:** `main` at the end of Sprint 2 (commit 2fe85c5), started with Docker Compose on a fresh database.
**Date:** 10 Nov 2026.
**Scope:** all 53 test cases of the Test Plan (40 functional, 6 non-functional, 7 security), run at system and integration level against the complete system.
**Detailed results:** the Actual Result and Result columns in [docs/test-plan](../test-plan/) (`tc-01` to `tc-04`), and Appendix A of the Test Plan document in `docs/submission`.
**Related reports:** [unit test report](unit-test-report.md), [code and branch coverage report](coverage-report.md), and one report per non-functional and security requirement in this folder.

## Results by feature

| Feature | Owner | Test cases | Pass | Pass with note | Partially executed |
|---------|-------|------------|------|----------------|--------------------|
| F1 Authentication and role management | Varun Rao | TC-AUTH-01 to 10, TC-NFR-01, TC-SEC-01, TC-SEC-02 | 13 | 0 | 0 |
| F2 Event creation and management | Thanishq Raam Patil | TC-EVT-01 to 10, TC-NFR-02, TC-NFR-06, TC-SEC-03 | 11 | 1 | 1 |
| F3 Registration and ticketing | Vishruta | TC-REG-01 to 10, TC-NFR-03, TC-NFR-04, TC-SEC-04, TC-SEC-05 | 14 | 0 | 0 |
| F4 Check-in, notifications and reports | Nithin Kumar M | TC-CHK-01 to 10, TC-NFR-05, TC-SEC-06, TC-SEC-07 | 12 | 1 | 0 |
| **Total** | | **53** | **50** | **2** | **1** |

**No test case failed.** Requirement coverage: all 43 requirements in the SRS have at least one executed test case.

## Results with a note

| Test case | Result | Note |
|-----------|--------|------|
| TC-NFR-02 | Pass (short test period) | 100% uptime over the test period, and Docker restarted the backend by itself after an engine restart. A month-long measurement needs a deployed server. |
| TC-NFR-05 | Pass with deviation | Coverage 86.79% lines and 78.64% branches (target 70% lines) and the CI gate works. SonarQube analysis was not run; the quality gate is enforced in CI by ESLint (0 errors) and the coverage threshold. |
| TC-NFR-06 | Partially executed (Chrome only) | All main flows pass in Chrome. Firefox and Edge were not tested. |

## Test cases updated to reflect the sprints

| Test case | Change | Reason |
|-----------|--------|--------|
| TC-EVT-01, TC-EVT-07, TC-EVT-09 | Test data uses the seeded category names (Technology, Music, "Workshop Series") | "Technical" does not exist and "Workshop" is already seeded, so adding it again is correctly refused as a duplicate |
| TC-EVT-09 | Expected result: cancelled and past events are not listed; a cancelled event's own page shows Cancelled | Search lists only upcoming published events (Sprint 1 review, deviation 7) |
| TC-NFR-01 | Steps: team load-test script (`backend/scripts/load-test.js`) instead of a JMeter plan | Runs inside the project's Docker setup with no extra tool; measures the same 95th percentile |
| TC-SEC-04 | Steps: `openssl s_client` with each TLS version instead of an SSL Labs or testssl.sh scan | SSL Labs can only scan public servers; the system runs locally |
| TC-NFR-05 | Steps and expected result: coverage gate and ESLint in CI instead of a SonarQube quality gate | SonarQube analysis was dropped; the CI checks enforce the same rule on every pull request |

## Test levels

| Level | How it was tested | Count |
|-------|-------------------|-------|
| Unit | Jest (backend) and Vitest (frontend), run in GitHub Actions on every pull request | 205 backend, 36 frontend ([unit test report](unit-test-report.md)) |
| Integration | API calls against the running backend and PostgreSQL database | test cases marked (I) |
| System | Full system through the web interface over HTTPS in Chrome | test cases marked (S) |

## Non-functional and security measurements

| Requirement | Result | Report |
|-------------|--------|--------|
| EVT-NF-001 Performance | 95th percentile 138 ms with 100 users for 5 minutes | [nf-001-performance.md](nf-001-performance.md) |
| EVT-NF-002 Availability | 100% over the test period, automatic restart | [nf-002-availability.md](nf-002-availability.md) |
| EVT-NF-003 Usability | 3 clicks for a visitor, no sideways scrolling from 360 px to 1920 px | [nf-003-usability.md](nf-003-usability.md) |
| EVT-NF-004 No overbooking | 3 runs of 500 requests for 100 seats: exactly 100 confirmed each time | [nf-004-concurrency.md](nf-004-concurrency.md) |
| EVT-NF-005 Coverage | 86.79% lines, 78.64% branches | [coverage-report.md](coverage-report.md) |
| EVT-NF-006 Browsers | Chrome passes; Firefox and Edge not tested | [nf-006-browser-compatibility.md](nf-006-browser-compatibility.md) |
| EVT-SR-003 Input validation | Injection and script strings handled safely | [sr-003-input-validation.md](sr-003-input-validation.md) |
| EVT-SR-004 HTTPS | TLS 1.0/1.1 refused, 1.2/1.3 accepted, HTTP redirected | [sr-004-https.md](sr-004-https.md) |

## Conclusion

The system meets its functional, security and measurable non-functional requirements on the final Sprint 2 build. The open points are a month-long availability measurement, which needs a deployed server, and testing in Firefox and Edge.
