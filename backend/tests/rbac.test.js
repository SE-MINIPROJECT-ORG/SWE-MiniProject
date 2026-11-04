const { requireRole } = require('../src/middleware/rbac');

function run(user, ...roles) {
  const next = jest.fn();
  requireRole(...roles)({ user }, {}, next);
  return next.mock.calls[0][0];
}

describe('requireRole (EVT-F-005)', () => {
  it('lets a user with an allowed role through', () => {
    expect(run({ id: 1, role: 'ORGANIZER' }, 'ORGANIZER', 'ADMIN')).toBeUndefined();
  });

  it('answers 403 FORBIDDEN for a role that is not allowed', () => {
    expect(run({ id: 1, role: 'ATTENDEE' }, 'ORGANIZER')).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });

  it('answers 401 when nobody is logged in', () => {
    expect(run(undefined, 'ADMIN')).toMatchObject({ status: 401 });
  });
});
