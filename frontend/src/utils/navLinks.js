// Navigation depends on the user's role (SAD section 4.5.1).
const COMMON = [{ to: '/', label: 'Events' }];

const BY_ROLE = {
  VISITOR: [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Sign up' },
  ],
  ATTENDEE: [{ to: '/attendee', label: 'My Registrations' }],
  ORGANIZER: [{ to: '/organizer', label: 'My Events' }],
  ADMIN: [{ to: '/admin', label: 'Admin Console' }],
};

const HOME_BY_ROLE = { ATTENDEE: '/attendee', ORGANIZER: '/organizer', ADMIN: '/admin' };

export function getNavLinks(role) {
  return [...COMMON, ...(BY_ROLE[role] || BY_ROLE.VISITOR)];
}

// The page a user lands on after logging in (EVT-F-002: "opens the role dashboard").
export function homePathForRole(role) {
  return HOME_BY_ROLE[role] || '/';
}
