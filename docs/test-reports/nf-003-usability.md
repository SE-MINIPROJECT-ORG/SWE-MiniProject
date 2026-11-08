# EVT-NF-003: Usability and Responsive Layout

**Requirement:** a new attendee shall be able to register for an event in no more than 3 clicks after opening its details page, and every page shall display correctly at screen widths from 360 px to 1920 px.
**Test case:** TC-NFR-03. **Owner:** Vishruta.

## Clicks to register

| Step | Click |
|------|-------|
| 1 | **Register** (or **Join waitlist** when the event is full) on the event page |

A logged-in attendee needs **1 click**. A visitor clicks **Log in** on the event page, logs in, and is brought back to the same event page, then clicks **Register**: 3 clicks in total (Log in, the Login button, Register).

## Layout from 360 px to 1920 px

- The navigation bar wraps onto a second line on narrow screens.
- Forms use the full width up to 420 px.
- Tables (organizer registration list) scroll inside their own box, so the page itself never scrolls sideways.
- The ticket QR code shrinks to fit the screen.

Checked at 360, 768, 1280 and 1920 px wide on the events list, event page, login, sign-up, my registrations, ticket, my events, create event and registrations list pages: no horizontal scrolling, no overlapping text.

**Verdict: PASS.**
