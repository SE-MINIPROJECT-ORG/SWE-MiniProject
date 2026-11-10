# EVT-NF-004: No Overbooking Under Concurrent Registrations

**Requirement:** under 500 simultaneous registration attempts for an event, the system shall never confirm more registrations than the event capacity.
**Test case:** TC-NFR-04. **Owner:** Vishruta.

## How it is guaranteed

Registration and cancellation each run in one database transaction that locks the event row (`SELECT ... FOR UPDATE`). Two registrations for the same event therefore run one after the other, so the seat count is always read and updated by one request at a time. A unique index also stops the same attendee from holding two active registrations.

## How to run the test

The script `backend/scripts/concurrency-test.js` creates 500 throwaway attendees and one published event with 50 seats, sends all 500 registration requests at the same moment, checks the result and deletes the test data again.

The normal rate limit (100 requests per minute per IP, EVT-SR-007) would block most of the 500 requests, so the backend is started with a higher limit for this test only:

```
$env:API_RATE_LIMIT = "100000"
docker compose up -d --build
docker compose exec backend node scripts/concurrency-test.js
Remove-Item Env:API_RATE_LIMIT
docker compose up -d
```

The last two lines put the normal limit back.

## Result

| Attempts | Capacity | HTTP 201 | Confirmed | Waitlisted | Overbooked | Time |
|----------|----------|----------|-----------|------------|------------|------|
| 500 | 50 | 500 | 50 | 450 | No | 2.7 s |
| 500 | 50 | 500 | 50 | 450 | No | 3.7 s (team laptop, Docker Desktop, 10 Nov 2026) |

**Verdict: PASS.** Confirmed registrations never exceeded the capacity, and every request was either confirmed or waitlisted.
