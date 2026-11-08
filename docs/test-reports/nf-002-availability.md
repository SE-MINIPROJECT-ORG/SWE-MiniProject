# EVT-NF-002: Availability

**Requirement:** the system shall be available at least 99% of each month, measured by health-check pings every minute, excluding announced maintenance.
**Test case:** TC-NFR-02. **Owner:** Thanishq Raam Patil.

## Implementation

- `GET /health` reports whether the API and the database are up (`200`), or `503` when the database is unreachable.
- Docker Compose restarts any service that stops (`restart: unless-stopped`) and checks the backend's health every 30 seconds.
- `backend/scripts/uptime-monitor.js` pings the health check once a minute and prints the running uptime percentage.

## How to measure

With the system running (`docker compose up -d`):

```
cd backend
npm run monitor
```

Leave it running for the measurement period, then press **Ctrl+C** to see the final uptime. For a quick check, run 10 pings 5 seconds apart:

```
$env:CHECKS = "10"; $env:INTERVAL_SECONDS = "5"; npm run monitor
```

## Result

| Period | Pings | Up | Uptime | Target |
|--------|-------|----|--------|--------|
| (fill in) | | | | 99% |

Recovery check: stopping the backend container with `docker kill swe-miniproject-backend-1` makes the monitor show `DOWN`; Docker restarts it and the next ping shows `UP` again.

A real month-long measurement needs a deployed server. On a laptop the monitor shows the method and short-period results.
