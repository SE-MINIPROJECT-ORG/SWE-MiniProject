# Code Coverage and Branch Coverage Report

**Build tested:** `main` at the end of Sprint 2, 10 Nov 2026. **Tools:** Jest coverage (Istanbul) for the backend, Vitest coverage (V8) for the frontend.
**Target (EVT-NF-005):** at least 70% line coverage of the backend code. The backend `npm test` enforces it: the run, and so CI, fails below 70% lines or statements.

**Line coverage** is the share of code lines run by at least one test. **Branch coverage** is the share of decision outcomes (each side of an `if`, `? :`, `&&`, `||`, `switch` case and default value) taken by at least one test, so it also shows which error paths are tested.

## Summary

| Code | Lines | Branches | Functions | Statements |
|------|-------|----------|-----------|------------|
| **Backend** (`backend/src`, application code) | **86.79%** | **78.64%** | 72.35% | 85.26% |
| Frontend logic (`frontend/src/utils`, `services`) | 68.85% | 78.65% | 73.33% | 68.85% |
| Frontend pages and components (`.jsx`) | 0.00% | 0.00% | 0.00% | 0.00% |

**Verdict for EVT-NF-005: PASS.** Backend line coverage is 86.79% (target 70%) and branch coverage is 78.64%.

The frontend pages and components have no unit tests: they are thin screens that call the tested API and the tested frontend logic modules, and every page is checked at system level in the browser by the system test cases (TC-AUTH, TC-EVT, TC-REG, TC-CHK, TC-NFR-03). The coverage target in the SRS applies to the backend.

## Backend coverage by file

| File | Lines | Branches | Functions | Statements |
|------|-------|----------|-----------|------------|
| `backend/src/app.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/config/db.js` | 80.0% | 100.0% | 0.0% | 80.0% |
| `backend/src/config/env.js` | 100.0% | 83.3% | 100.0% | 100.0% |
| `backend/src/middleware/auth.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/middleware/errorHandler.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/middleware/rateLimiter.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/middleware/rbac.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/middleware/requestId.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/auth/auth.controller.js` | 100.0% | 75.0% | 100.0% | 95.2% |
| `backend/src/modules/auth/auth.repository.js` | 12.5% | 0.0% | 0.0% | 12.5% |
| `backend/src/modules/auth/auth.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/auth/auth.service.js` | 93.8% | 84.3% | 100.0% | 90.1% |
| `backend/src/modules/auth/auth.validation.js` | 100.0% | 77.6% | 100.0% | 91.9% |
| `backend/src/modules/checkin/checkin.controller.js` | 100.0% | 75.0% | 100.0% | 85.7% |
| `backend/src/modules/checkin/checkin.repository.js` | 14.3% | 0.0% | 0.0% | 14.3% |
| `backend/src/modules/checkin/checkin.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/checkin/checkin.service.js` | 100.0% | 95.8% | 100.0% | 100.0% |
| `backend/src/modules/events/events.controller.js` | 100.0% | 87.5% | 100.0% | 95.7% |
| `backend/src/modules/events/events.repository.js` | 38.5% | 25.0% | 17.6% | 38.5% |
| `backend/src/modules/events/events.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/events/events.service.js` | 95.2% | 90.7% | 100.0% | 94.8% |
| `backend/src/modules/events/events.validation.js` | 97.9% | 80.5% | 100.0% | 88.9% |
| `backend/src/modules/health/health.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/notifications/mailer.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/notifications/notification.service.js` | 100.0% | 83.3% | 100.0% | 100.0% |
| `backend/src/modules/notifications/notifications.controller.js` | 100.0% | 75.0% | 100.0% | 87.5% |
| `backend/src/modules/notifications/notifications.repository.js` | 16.7% | 0.0% | 0.0% | 16.7% |
| `backend/src/modules/notifications/notifications.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/notifications/scheduler.js` | 77.8% | 0.0% | 50.0% | 70.0% |
| `backend/src/modules/registrations/registrations.controller.js` | 100.0% | 75.0% | 100.0% | 92.8% |
| `backend/src/modules/registrations/registrations.repository.js` | 6.1% | 0.0% | 0.0% | 6.1% |
| `backend/src/modules/registrations/registrations.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/registrations/registrations.service.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/reports/reports.controller.js` | 100.0% | 75.0% | 100.0% | 92.3% |
| `backend/src/modules/reports/reports.repository.js` | 18.2% | 0.0% | 0.0% | 14.3% |
| `backend/src/modules/reports/reports.routes.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/modules/reports/reports.service.js` | 100.0% | 93.3% | 100.0% | 97.4% |
| `backend/src/utils/AppError.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/utils/asyncHandler.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/utils/auditLogger.js` | 100.0% | 75.0% | 100.0% | 100.0% |
| `backend/src/utils/logger.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/utils/sanitize.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `backend/src/utils/withTransaction.js` | 100.0% | 100.0% | 100.0% | 100.0% |

## Frontend coverage by file

| File | Lines | Branches | Functions | Statements |
|------|-------|----------|-----------|------------|
| `frontend/src/App.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/auth/AuthContext.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/components/EventForm.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/components/RegisterButton.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/components/RequireRole.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/layouts/Layout.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/main.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/AdminCategoriesPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/AdminDashboardPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/AdminUsersPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/CheckInPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/CreateEventPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/EditEventPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/EventDetailPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/EventRegistrationsPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/EventReportPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/HomePage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/LoginPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/MyEventsPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/MyRegistrationsPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/NotFoundPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/NotificationsPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/ProfilePage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/RegisterPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/pages/TicketPage.jsx` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/apiClient.js` | 100.0% | 75.0% | 100.0% | 100.0% |
| `frontend/src/services/authApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/checkinApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/eventsApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/notificationsApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/registrationsApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/reportsApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/services/usersApi.js` | 0.0% | 0.0% | 0.0% | 0.0% |
| `frontend/src/utils/events.js` | 95.3% | 75.0% | 85.7% | 95.3% |
| `frontend/src/utils/navLinks.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `frontend/src/utils/notifications.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `frontend/src/utils/registrations.js` | 100.0% | 92.3% | 100.0% | 100.0% |
| `frontend/src/utils/reports.js` | 100.0% | 100.0% | 100.0% | 100.0% |
| `frontend/src/utils/validation.js` | 100.0% | 88.2% | 100.0% | 100.0% |

## Backend files with branch coverage below 70%

The repository files hold the SQL queries. Unit tests replace them with mocks so that the business rules can be tested without a database, and the queries themselves are run against the real PostgreSQL database by the system test cases (Appendix A of the Test Plan) and the concurrency test (TC-NFR-04). The scheduler only starts the timed reminder job; the job itself (`runReminderJob`) is unit-tested and the timing is checked by TC-CHK-05.

| File | Branches |
|------|----------|
| `backend/src/modules/auth/auth.repository.js` | 0.0% |
| `backend/src/modules/checkin/checkin.repository.js` | 0.0% |
| `backend/src/modules/notifications/notifications.repository.js` | 0.0% |
| `backend/src/modules/notifications/scheduler.js` | 0.0% |
| `backend/src/modules/registrations/registrations.repository.js` | 0.0% |
| `backend/src/modules/reports/reports.repository.js` | 0.0% |
| `backend/src/modules/events/events.repository.js` | 25.0% |

## Detailed HTML reports

Line-by-line reports that show every covered and uncovered line and branch:

- Backend: [coverage-html/backend/index.html](coverage-html/backend/index.html)
- Frontend: [coverage-html/frontend/index.html](coverage-html/frontend/index.html)

Download the repository and open the file in a browser. To regenerate: `cd backend` then `npm test` (writes `backend/coverage`).