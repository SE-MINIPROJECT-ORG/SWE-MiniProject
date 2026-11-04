import { describe, it, expect } from 'vitest';
import { validateEventForm, localInputToIso, seatsText } from './events.js';

const now = new Date('2026-11-01T10:00:00');
const valid = {
  title: 'Tech Talk', venue: 'Hall A', categoryId: '1',
  startTime: '2026-11-10T10:00', endTime: '2026-11-10T12:00', capacity: '50',
};

describe('validateEventForm', () => {
  it('accepts a valid event', () => {
    expect(validateEventForm(valid, now)).toEqual({});
  });

  it('rejects an empty title and a start in the past', () => {
    const errors = validateEventForm({ ...valid, title: ' ', startTime: '2026-10-01T10:00' }, now);
    expect(Object.keys(errors).sort()).toEqual(['startTime', 'title']);
  });

  it('rejects an end before the start', () => {
    expect(validateEventForm({ ...valid, endTime: '2026-11-10T09:00' }, now).endTime).toBeDefined();
  });

  it('rejects capacity outside 1 to 10000', () => {
    expect(validateEventForm({ ...valid, capacity: '0' }, now).capacity).toBeDefined();
    expect(validateEventForm({ ...valid, capacity: '10001' }, now).capacity).toBeDefined();
    expect(validateEventForm({ ...valid, capacity: '2.5' }, now).capacity).toBeDefined();
  });
});

describe('localInputToIso', () => {
  it('converts a datetime-local value to ISO', () => {
    expect(localInputToIso('2026-11-10T10:00')).toBe(new Date('2026-11-10T10:00').toISOString());
  });

  it('returns an empty string for empty input', () => {
    expect(localInputToIso('')).toBe('');
  });
});

describe('seatsText', () => {
  it('shows free seats or that the event is full', () => {
    expect(seatsText({ seatsLeft: 3, capacity: 10 })).toBe('3 of 10 seats left');
    expect(seatsText({ seatsLeft: 0, capacity: 10 })).toBe('Full (waitlist open)');
  });
});
