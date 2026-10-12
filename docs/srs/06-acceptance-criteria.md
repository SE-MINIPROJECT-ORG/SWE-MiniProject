# 6. Quality Attributes and Acceptance Tests

## 6.1 Exit Criteria for Acceptance
- All High-priority functional requirements are implemented and verified
- No critical or high-severity defect is open
- All non-functional and security requirements meet their measured targets
- The Requirements Traceability Matrix (section 8) shows every requirement mapped to at least one passed test case

## 6.2 Acceptance Test Suites

| Suite | Covers | Test Case Prefix |
|-------|--------|------------------|
| Authentication and Roles | EVT-F-001 to EVT-F-007 | TC-AUTH |
| Event Management | EVT-F-010 to EVT-F-016 | TC-EVT |
| Registration and Ticketing | EVT-F-020 to EVT-F-027 | TC-REG |
| Check-in, Notifications and Reports | EVT-F-030 to EVT-F-037 | TC-CHK |
| Non-Functional (performance, availability, usability, concurrency, maintainability, compatibility) | EVT-NF-001 to EVT-NF-006 | TC-NFR |
| Security | EVT-SR-001 to EVT-SR-007 | TC-SEC |

## 6.3 Quality Attributes Summary

| Attribute | Target |
|-----------|--------|
| Performance | 95% of API requests within 2 s at 100 concurrent users |
| Reliability | 99% monthly availability |
| Usability | A new attendee registers for an event in 3 clicks or fewer after opening it |
| Scalability and correctness | No overbooking under 500 simultaneous registration attempts |
| Maintainability | At least 70% unit test line coverage and a passing static-analysis quality gate |
| Compatibility | Latest two versions of Chrome, Firefox and Edge |
