# Test Execution Summary

**Build tested:** `main` at the end of Sprint 2 (commit 2fe85c5), started with Docker Compose on a fresh database.
**Date:** 10 Nov 2026.
**Detailed results:** the Actual Result and Result columns in [docs/test-plan](../test-plan/) (`tc-01` to `tc-04`).

## Results by feature

| Feature | Owner | Test cases | Pass | Pass with note | Pending |
|---------|-------|------------|------|----------------|---------|
| F1 Authentication and role management | Varun Rao | TC-AUTH-01 to 10, TC-NFR-01, TC-SEC-01, TC-SEC-02 | 13 | 0 | 0 |
| F2 Event creation and management | Thanishq Raam Patil | TC-EVT-01 to 10, TC-NFR-02, TC-NFR-06, TC-SEC-03 | 10 | 2 | 1 |
| F3 Registration and ticketing | Vishruta | TC-REG-01 to 10, TC-NFR-03, TC-NFR-04, TC-SEC-04, TC-SEC-05 | 14 | 0 | 0 |
| F4 Check-in, notifications and reports | Nithin Kumar M | TC-CHK-01 to 10, TC-NFR-05, TC-SEC-06, TC-SEC-07 | 12 | 0 | 1 |
| **Total** | | **53** | **49** | **2** | **2** |

No test case failed.

## Results with a note

| Test case | Result | Note |
|-----------|--------|------|
| TC-EVT-09 | Pass with deviation | Filters and pages of 10 work. The test expected cancelled events to be listed with a "Cancelled" label; the system lists only upcoming published events (Sprint 1 review, deviation 7). A cancelled event's own page shows "Status: CANCELLED". |
| TC-NFR-02 | Pass (short test period) | 100% uptime over the test period, and Docker restarted the backend by itself after an engine restart. A month-long measurement needs a deployed server. |

## Still to do

| Test case | What is missing | Who |
|-----------|-----------------|-----|
| TC-NFR-05 | Run SonarQube and record the quality gate result (coverage part passes: 86.79% lines) | Nithin |
| TC-NFR-06 | Run the checklist in Firefox and Edge (Chrome passes) | Thanishq |

## Test levels

| Level | How it was tested | Count |
|-------|-------------------|-------|
| Unit | Jest (backend) and Vitest (frontend), run in GitHub Actions on every pull request | 205 backend, 36 frontend |
| Integration | API calls against the running backend and database | test cases marked (I) |
| System | Full system through the web interface over HTTPS | test cases marked (S) |

## Changes to the test procedure

| Test case | Planned | Used instead | Reason |
|-----------|---------|--------------|--------|
| TC-NFR-01 | JMeter plan | `backend/scripts/load-test.js`, 100 users for 5 minutes | Runs inside the project's Docker setup with no extra tool to install; measures the same 95th percentile response time. |
| TC-SEC-04 | SSL Labs or testssl.sh scan | `openssl s_client` connections with each TLS version | SSL Labs can only scan public servers; the system runs locally. |
| TC-EVT-07 | Add category "Workshop" | Added "Workshop Series" | "Workshop" is already one of the seeded categories, so adding it again is correctly refused as a duplicate. |
| TC-EVT-01, 07, 09 | Category "Technical" | Category "Technology" | The seeded category is named "Technology". |
