# EVT-SR-003: Input Validation and Parameterized Queries

**Requirement:** all user input shall be validated and sanitized on the server, and database access shall use parameterized queries, to prevent SQL injection and cross-site scripting.
**Test case:** TC-SEC-03. **Owner:** Thanishq Raam Patil.

## Implementation

| Protection | Where |
|------------|-------|
| Every request body and query string is checked on the server: types, required fields, lengths, number ranges and dates. Wrong input gets `400 VALIDATION_ERROR` with field details. | `*.validation.js` in each module |
| Free text (titles, descriptions, venues, category names) is cleaned: invisible control characters removed and spaces trimmed. | `backend/src/utils/sanitize.js` |
| IDs in the URL must be whole numbers, otherwise `404` before any database call. | controllers |
| All SQL uses `$1, $2, ...` placeholders; user values are never joined into the SQL text. Search keywords also escape `%` and `_`. | `*.repository.js` |
| Text is stored as plain text, and React escapes it when it is shown, so `<script>` in a title appears as text and never runs (XSS). | frontend |
| Security headers on API responses (Content-Security-Policy, `nosniff`, no `X-Powered-By`) through `helmet`; the same headers on the web app through nginx. | `backend/src/app.js`, `frontend/nginx.conf` |
| Request bodies are limited to 100 KB, and invalid JSON gets `400`. | `backend/src/app.js` |

## Automated tests

`backend/tests/security.test.js` checks that:
- control characters are removed and non-text input becomes empty;
- an object in place of a title, or `1 OR 1=1` as a category ID, is rejected;
- a search for `x'; DROP TABLE users; --` reaches the database only as a parameter, never inside the SQL text;
- an event ID of `1 OR 1=1` is answered with 404 without touching the database;
- the security headers are present.

## Manual check

1. Search for `' OR 1=1 --` on the events page: the result is "No events match your search", not every event.
2. Create an event titled `<script>alert(1)</script>`: the title is shown as plain text and no alert appears.

**Verdict: PASS.**
