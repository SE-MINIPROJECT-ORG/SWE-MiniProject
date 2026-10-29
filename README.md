# Event Management System

**UE24CS341A – Software Engineering Mini Project (Jackfruit)**
B.Tech CSE, V Semester, PES University

A web-based system to create, manage and organize events with attendee registrations, ticketing, check-in and reporting.

## Project Description

The Event Management System lets organizers publish events and manage capacity and schedules, lets attendees discover events and register for them, and lets administrators oversee the platform. It is built with Agile methodology, with requirements, architecture, design, testing and CI/CD maintained in this repository.

## Functional Features

| ID | Feature | Owner |
|----|---------|-------|
| F1 | User authentication and role management (attendee, organizer, admin) | Varun Rao |
| F2 | Event creation and management (create, edit, cancel, capacity, schedule, categories) | Thanishq Raam Patil |
| F3 | Event registration and ticketing (register, cancel, waitlist, confirmation) | Vishruta |
| F4 | Attendance check-in, notifications and event reports | Nithin Kumar M |

## Team

| Member | Name | SRN | GitHub |
|--------|------|-----|--------|
| 1 | Varun Rao | PES1UG24CS520 | varunrao024 |
| 2 | Thanishq Raam Patil | PES1UG24CS502 | thanishqraam17 |
| 3 | Vishruta (repo owner) | PES1UG24CS538 | Vish-K-A |
| 4 | Nithin Kumar M | PES1UG25CS829 | Nithinkumar7760 |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Testing | Jest (unit/integration), Supertest (API) |
| CI/CD | GitHub Actions |
| Static analysis | SonarQube |
| Containerization | Docker |
| Project management | GitHub Projects + Issues |

## Repository Structure

```
.
├── .github/            # PR template, issue templates, workflows
├── backend/            # Node.js + Express API
├── frontend/           # React.js application
├── docs/
│   ├── srs/            # Software Requirements Specification
│   ├── sad/            # Software Architecture and Design Specification
│   ├── test-plan/      # Software Test Plan and test cases
│   ├── project-plan/   # Project plan, WBS, estimates
│   └── diagrams/       # UML and other diagrams
├── CONTRIBUTING.md     # Branching, commit and PR rules
├── LICENSE
└── README.md
```

## Getting Started

### Run the whole system with Docker (recommended)

Requires Docker Desktop.

```
docker compose up --build
```

| What | URL |
|------|-----|
| Web app | http://localhost:8080 |
| API health check | http://localhost:5000/health |
| Test emails (MailHog) | http://localhost:8025 |

The backend applies the database migrations and creates the test accounts on start. All test accounts use the password `Test@1234`: `attendee1@ems.test` to `attendee4@ems.test`, `organizer1@ems.test`, `organizer2@ems.test` and `admin@ems.test`.

Stop with `Ctrl+C`, then `docker compose down`. Add `-v` to also delete the database.

### Run for development

Start only the database and mail catcher with Docker, then run the backend and frontend directly:

```
docker compose up -d db mailhog
cd backend
copy .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

In a second terminal:

```
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173 and forwards `/api` calls to the backend on port 5000.

### Tests

```
cd backend
npm test
cd ../frontend
npm test
```

GitHub Actions runs lint, tests and the frontend build on every pull request.

### Static analysis (SonarQube)

```
docker compose -f docker-compose.sonar.yml up -d
```

Open http://localhost:9000 (first login `admin` / `admin`, then set a new password). Create a local project with the key `ems` and generate a token. Then run the tests (for coverage) and the scanner from the repository root:

```
cd backend
npm test
cd ..
docker run --rm -e SONAR_HOST_URL=http://host.docker.internal:9000 -e SONAR_TOKEN=<your-token> -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```

## Workflow

All work is done on feature branches and merged into `main` through reviewed pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Project Status

- [x] Requirements (SRS)
- [x] Architecture and Design (SAD)
- [x] Test Plan
- [ ] Implementation
- [ ] System validation and demo
