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

Setup and run instructions will be added once the backend and frontend are scaffolded.

## Workflow

All work is done on feature branches and merged into `main` through reviewed pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Project Status

- [ ] Requirements (SRS)
- [ ] Architecture and Design (SAD)
- [ ] Test Plan
- [ ] Implementation
- [ ] System validation and demo
