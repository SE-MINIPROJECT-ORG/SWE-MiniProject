import { describe, it, expect } from 'vitest';
import { percentText, breakdown } from './reports.js';

describe('percentText', () => {
  it('shows whole numbers without a decimal and others with one', () => {
    expect(percentText(80)).toBe('80%');
    expect(percentText(33.3)).toBe('33.3%');
    expect(percentText(undefined)).toBe('0%');
  });
});

describe('breakdown', () => {
  it('lists counts in the given order with readable labels and zeros', () => {
    expect(breakdown({ CONFIRMED: 5, CHECKED_IN: 1 }, ['CONFIRMED', 'WAITLISTED', 'CHECKED_IN'])).toEqual([
      { key: 'CONFIRMED', label: 'Confirmed', value: 5 },
      { key: 'WAITLISTED', label: 'Waitlisted', value: 0 },
      { key: 'CHECKED_IN', label: 'Checked in', value: 1 },
    ]);
  });
});
