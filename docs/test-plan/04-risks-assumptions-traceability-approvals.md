# Test Plan Sections 10 to 15: Risks, Assumptions, Suspension, Traceability, Metrics, Approvals

**Author:** Nithin Kumar M (PES1UG25CS829)

## 10. Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Short sprints leave little time to test | Write test cases before coding, automate unit tests early and run them in CI |
| A feature depends on another member's feature (for example check-in needs tickets) | Agree the data and API shapes early and use seeded test data |
| Test environment or database breaks | Keep seed and reset scripts in the repository so the environment can be rebuilt quickly |
| Email service is unavailable or slow | Use a mock SMTP server for tests |
| Concurrency and performance tests need many accounts and a stable machine | Generate test accounts by script and run the load test on a quiet machine |
| Team member is unavailable | Every test case is reviewed by a second member, who can run it |

## 11. Assumptions and Dependencies

- A stable build is available at the start of each sprint
- Test data and the mock SMTP server are available before execution
- The SRS requirements and acceptance criteria are the baseline for the expected results
- All event times use one configured time zone
- GitHub Actions is enabled for the repository

## 12. Suspension and Resumption Criteria

**Suspend testing if:**
- The test environment is unavailable for more than 4 hours
- The build is so unstable that more than 30% of the planned test cases are blocked
- A critical defect blocks the login or registration flow

**Resume testing when:**
- The blocking defects are fixed and a new build is deployed
- The environment is stable again and a smoke test (TC-AUTH-03, TC-EVT-01, TC-REG-01, TC-CHK-01) passes

## 13. Test Case Management and Traceability

Test cases are stored in `docs/test-plan/` and use the ID prefixes defined in SRS 6.2. Every requirement maps to at least one test case, and the table below is the source for section 8 (RTM) of the SRS.

| Requirement ID | Test cases |
|----------------|------------|
| EVT-F-001 | TC-AUTH-01, TC-AUTH-02, TC-AUTH-10 |
| EVT-F-002 | TC-AUTH-03, TC-AUTH-09 |
| EVT-F-003 | TC-AUTH-04 |
| EVT-F-004 | TC-AUTH-05 |
| EVT-F-005 | TC-AUTH-06, TC-EVT-10 |
| EVT-F-006 | TC-AUTH-07 |
| EVT-F-007 | TC-AUTH-08 |
| EVT-F-010 | TC-EVT-01, TC-EVT-10 |
| EVT-F-011 | TC-EVT-02, TC-EVT-03 |
| EVT-F-012 | TC-EVT-04 |
| EVT-F-013 | TC-EVT-05 |
| EVT-F-014 | TC-EVT-06 |
| EVT-F-015 | TC-EVT-07 |
| EVT-F-016 | TC-EVT-08, TC-EVT-09 |
| EVT-F-020 | TC-REG-01, TC-REG-02 |
| EVT-F-021 | TC-REG-03 |
| EVT-F-022 | TC-REG-04 |
| EVT-F-023 | TC-REG-05, TC-REG-10 |
| EVT-F-024 | TC-REG-06 |
| EVT-F-025 | TC-REG-07 |
| EVT-F-026 | TC-REG-08 |
| EVT-F-027 | TC-REG-09 |
| EVT-F-030 | TC-CHK-01 |
| EVT-F-031 | TC-CHK-02, TC-CHK-03 |
| EVT-F-032 | TC-CHK-04 |
| EVT-F-033 | TC-CHK-05 |
| EVT-F-034 | TC-CHK-06 |
| EVT-F-035 | TC-CHK-07, TC-CHK-10 |
| EVT-F-036 | TC-CHK-08 |
| EVT-F-037 | TC-CHK-09 |
| EVT-NF-001 | TC-NFR-01 |
| EVT-NF-002 | TC-NFR-02 |
| EVT-NF-003 | TC-NFR-03 |
| EVT-NF-004 | TC-NFR-04 |
| EVT-NF-005 | TC-NFR-05 |
| EVT-NF-006 | TC-NFR-06 |
| EVT-SR-001 | TC-SEC-01 |
| EVT-SR-002 | TC-SEC-02 |
| EVT-SR-003 | TC-SEC-03 |
| EVT-SR-004 | TC-SEC-04 |
| EVT-SR-005 | TC-SEC-05 |
| EVT-SR-006 | TC-SEC-06 |
| EVT-SR-007 | TC-SEC-07 |

**Test case count per feature:** F1 has 10 (TC-AUTH), F2 has 10 (TC-EVT), F3 has 10 (TC-REG) and F4 has 10 (TC-CHK), plus 6 non-functional and 7 security test cases, which is 53 in total.

## 14. Test Metrics and Reporting

**Metrics collected:**
- Percentage of test cases executed
- Percentage passed and failed
- Defect count by severity and by feature (defect density)
- Defect aging (days from raised to closed)
- Requirement coverage (requirements with at least one passed test case)
- Unit test line coverage (target 70% or higher)

**Reports:**
- Status of executed test cases at the end of each sprint
- Final test summary report with the Actual Result and Result columns completed

## 15. Approvals

| Role | Name | Signature / Date |
|------|------|------------------|
| Test Lead | Varun Rao | |
| Repository owner | Vishruta | |
| Course faculty | | |
