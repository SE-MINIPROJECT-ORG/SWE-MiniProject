# EVT-NF-005: Unit Test Coverage and Quality Gate

**Requirement:** the backend code shall reach at least 70% unit test line coverage and pass the static-analysis quality gate with no blocker or critical issues before each release.
**Test case:** TC-NFR-05. **Owner:** Nithin Kumar M.

## Coverage gate in CI

`backend/package.json` sets a Jest coverage threshold of 70% for lines and statements. `npm test` runs with coverage and **fails when the threshold is not met**, so the "Backend CI" check turns red and branch protection blocks the merge.

Check: running Jest with the threshold temporarily raised to 95% makes it exit with an error ("coverage threshold for lines (95%) not met: 86.79%"), so a drop below 70% fails CI.

## Coverage at the end of Sprint 2

| Metric | Result | Target |
|--------|--------|--------|
| Lines | 86.8% | 70% |
| Branches | 78.6% | not set |
| Statements | 85.3% | 70% |
| Backend unit tests | 205 passed, 0 failed | all pass |
| Frontend unit tests | 36 passed, 0 failed | all pass |

Full figures per file: [coverage-report.md](coverage-report.md).

## Static analysis

ESLint runs in CI on every pull request for the backend and the frontend, and a lint error fails the check, so it blocks the merge. Result at the end of Sprint 2: 0 errors.

SonarQube was planned as the static-analysis tool. The setup is in the repository (`docker-compose.sonar.yml`, `sonar-project.properties`), but the analysis was not run: the quality gate is enforced by ESLint and the coverage threshold in CI instead. This is recorded as a deviation for TC-NFR-05.

**Verdict: PASS with deviation.** Coverage and lint gates pass; SonarQube analysis not run.
