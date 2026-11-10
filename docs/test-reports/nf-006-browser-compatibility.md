# EVT-NF-006: Browser Compatibility

**Requirement:** the web interface shall work correctly on the latest two versions of Google Chrome, Mozilla Firefox and Microsoft Edge.
**Test case:** TC-NFR-06. **Owner:** Thanishq Raam Patil.

## Implementation

- The app uses only standard HTML, CSS and JavaScript supported by all three browsers; no browser-specific features.
- The production build targets Chrome 120, Firefox 120 and Edge 120 or newer (`frontend/vite.config.js`).
- Date and time fields use the standard `datetime-local` input, which all three browsers support.

## Result

| # | Check | Chrome | Firefox | Edge |
|---|-------|--------|---------|------|
| 1 | Sign up and log in | PASS | Not tested | Not tested |
| 2 | Browse, search and filter events, next page | PASS | Not tested | Not tested |
| 3 | Create, edit and publish an event (date and time pickers work) | PASS | Not tested | Not tested |
| 4 | Register, join waitlist, cancel | PASS | Not tested | Not tested |
| 5 | Ticket page shows the QR code | PASS | Not tested | Not tested |
| 6 | Check-in by ticket ID | PASS | Not tested | Not tested |
| 7 | Notifications list and Mark as read | PASS | Not tested | Not tested |
| 8 | Admin pages (users, categories, dashboard) | PASS | Not tested | Not tested |
| 9 | Layout at 360 px and 1920 px | PASS | Not tested | Not tested |

**Browser used:** Chromium 153 (the engine of Google Chrome).

**Verdict: partially executed.** Every check passes in Chrome. Firefox and Edge were not tested; the app uses only standard HTML, CSS and JavaScript and the build targets both browsers, but this has not been confirmed by a test run.
