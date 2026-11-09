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
| Statements | 85.3% | 70% |
| Backend unit tests | 205 passed, 0 failed | all pass |
| Frontend unit tests | 36 passed, 0 failed | all pass |

## Static analysis (SonarQube)

`sonar-project.properties` points SonarQube at the backend and frontend code and the backend coverage report, and `sonar.qualitygate.wait=true` makes the scanner fail when the quality gate fails. The default "Sonar way" gate fails on new blocker or critical issues.

How to run (Docker Desktop open, from the repository root):

```
docker compose -f docker-compose.sonar.yml up -d
```

Open http://localhost:9000, log in with `admin` / `admin` and set a new password, create a local project with the key `ems`, and generate a token. Then:

```
cd backend
npm test
cd ..
docker run --rm -e SONAR_HOST_URL=http://host.docker.internal:9000 -e SONAR_TOKEN=<your-token> -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```

## SonarQube result

| Item | Result |
|------|--------|
| Quality gate | (fill in: Passed / Failed) |
| Blocker issues | |
| Critical issues | |
| Coverage shown | |

Add a screenshot of the SonarQube project page next to this file as `sonarqube-result.png`.
