import { describe, it, expect } from 'vitest';
import { statusLabel, canCancel, registerResultMessage } from './registrations.js';

const now = new Date('2026-11-01T10:00:00Z');
const reg = (change = {}) => ({
  status: 'CONFIRMED', ticketId: 'TKT-1', queuePosition: null,
  event: { startTime: '2026-11-10T10:00:00Z' }, ...change,
});

describe('statusLabel', () => {
  it('shows the waitlist position', () => {
    expect(statusLabel(reg({ status: 'WAITLISTED', queuePosition: 2 }))).toBe('Waitlisted (position 2)');
  });

  it('shows readable labels', () => {
    expect(statusLabel(reg())).toBe('Confirmed');
    expect(statusLabel(reg({ status: 'CHECKED_IN' }))).toBe('Checked in');
  });
});

describe('canCancel', () => {
  it('allows cancelling an active registration before the event', () => {
    expect(canCancel(reg(), now)).toBe(true);
    expect(canCancel(reg({ status: 'WAITLISTED' }), now)).toBe(true);
  });

  it('does not allow cancelling a cancelled registration or a started event', () => {
    expect(canCancel(reg({ status: 'CANCELLED' }), now)).toBe(false);
    expect(canCancel(reg({ event: { startTime: '2026-10-01T10:00:00Z' } }), now)).toBe(false);
  });
});

describe('registerResultMessage', () => {
  it('shows the ticket ID or the waitlist position', () => {
    expect(registerResultMessage(reg())).toContain('TKT-1');
    expect(registerResultMessage(reg({ status: 'WAITLISTED', queuePosition: 4 }))).toContain('position 4');
  });
});
