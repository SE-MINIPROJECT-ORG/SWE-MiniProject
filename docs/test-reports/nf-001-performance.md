# EVT-NF-001: Performance

**Requirement:** at least 95% of API requests shall complete within 2 seconds with 100 concurrent users on the reference test environment.
**Test case:** TC-NFR-01. **Owner:** Varun Rao.

## How it is met

- Database indexes on the columns used by the busiest queries: `events(status, start_time)`, `events(category_id)`, `registrations(event_id, status)` and `registrations(ticket_id)`.
- Event lists are paginated at 10 per page, so a response never grows with the number of events.
- Emails are sent in the background after the response, so a slow mail server never slows a request.

## How to run the test

`backend/scripts/load-test.js` starts 100 simulated users. Each one keeps sending a realistic mix of requests (browse and search events, open an event, list categories, my registrations) for 30 seconds. It then prints the response times and the share of requests that succeeded within 2 seconds.

The normal rate limit (100 requests per minute per IP, EVT-SR-007) would block a load test from one computer, so the limit is raised for this test only:

```
$env:API_RATE_LIMIT = "10000000"
docker compose up -d --build
docker compose exec backend node scripts/load-test.js
Remove-Item Env:API_RATE_LIMIT
docker compose up -d
```

## Result

Reference environment: the project's Docker Compose setup on one machine, with 7 users and 40 published events in the database.

| Users | Duration | Requests | Errors | Median | 95th percentile | Max | Within 2 s |
|-------|----------|----------|--------|--------|-----------------|-----|------------|
| 100 | 20 s | 22,614 | 0 | 88 ms | 141 ms | 386 ms | 100% |

**Verdict: PASS.** The 95th percentile (141 ms) is far below the 2-second limit.

Run it again on your own machine before the final submission and add the numbers as a second row.
