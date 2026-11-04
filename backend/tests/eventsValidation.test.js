const { validateEvent, validateSearch } = require('../src/modules/events/events.validation');

const now = new Date('2026-11-01T10:00:00Z');
const valid = {
  title: 'Tech Talk', description: 'About Node', venue: 'Hall A', categoryId: 1,
  startTime: '2026-11-10T10:00:00Z', endTime: '2026-11-10T12:00:00Z', capacity: 50,
};
const fields = (change) => validateEvent({ ...valid, ...change }, now).errors.map((e) => e.field);

describe('event validation (EVT-F-011)', () => {
  it('accepts a valid event', () => {
    expect(fields({})).toEqual([]);
  });

  it.each([
    ['an empty title', { title: '  ' }, 'title'],
    ['a start that is not in the future', { startTime: '2026-11-01T09:00:00Z' }, 'startTime'],
    ['an end before the start', { endTime: '2026-11-10T09:00:00Z' }, 'endTime'],
    ['an end equal to the start', { endTime: '2026-11-10T10:00:00Z' }, 'endTime'],
    ['capacity 0', { capacity: 0 }, 'capacity'],
    ['capacity 10001', { capacity: 10001 }, 'capacity'],
    ['a decimal capacity', { capacity: 2.5 }, 'capacity'],
    ['a missing venue', { venue: '' }, 'venue'],
    ['a missing category', { categoryId: undefined }, 'categoryId'],
    ['an invalid date', { startTime: 'not a date' }, 'startTime'],
  ])('rejects %s', (_label, change, field) => {
    expect(fields(change)).toEqual([field]);
  });

  it('accepts capacity at the limits 1 and 10000', () => {
    expect(fields({ capacity: 1 })).toEqual([]);
    expect(fields({ capacity: '10000' })).toEqual([]);
  });
});

describe('search validation (EVT-F-016)', () => {
  it('defaults to page 1', () => {
    expect(validateSearch({}).value.page).toBe(1);
  });

  it('rejects a bad page and a bad date', () => {
    expect(validateSearch({ page: '0', from: 'x' }).errors.map((e) => e.field)).toEqual(['page', 'from']);
  });
});
