# EVT-NF-006: Browser Compatibility

**Requirement:** the web interface shall work correctly on the latest two versions of Google Chrome, Mozilla Firefox and Microsoft Edge.
**Test case:** TC-NFR-06. **Owner:** Thanishq Raam Patil.

## Implementation

- The app uses only standard HTML, CSS and JavaScript supported by all three browsers; no browser-specific features.
- The production build targets Chrome 120, Firefox 120 and Edge 120 or newer (`frontend/vite.config.js`).
- Date and time fields use the standard `datetime-local` input, which all three browsers support.

## Checklist

Run on https://localhost:8443 in each browser. Mark each cell PASS or FAIL.

| # | Check | Chrome | Firefox | Edge |
|---|-------|--------|---------|------|
| 1 | Sign up and log in | | | |
| 2 | Browse, search and filter events, next page | | | |
| 3 | Create, edit and publish an event (date and time pickers work) | | | |
| 4 | Register, join waitlist, cancel | | | |
| 5 | Ticket page shows the QR code; Print works | | | |
| 6 | Check-in by ticket ID | | | |
| 7 | Notifications list and Mark as read | | | |
| 8 | Admin pages (users, categories, dashboard) | | | |
| 9 | Layout at narrow width (developer tools, 360 px) | | | |

**Browser versions used:** Chrome ___, Firefox ___, Edge ___ (Help > About in each browser).

**Verdict:** (fill in after the checks)
