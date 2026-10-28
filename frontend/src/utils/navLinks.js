// Navigation depends on the user's role (SAD section 4.5.1).
const COMMON = [{ to: '/', label: 'Events' }];

const BY_ROLE = {
  VISITOR: [{ to: '/login', label: 'Login' }],
  ATTENDEE: [{ to: '/attendee', label: 'My Registrations' }],
  ORGANIZER: [{ to: '/organizer', label: 'My Events' }],
  ADMIN: [{ to: '/admin', label: 'Admin Console' }],
};

export function getNavLinks(role) {
  return [...COMMON, ...(BY_ROLE[role] || BY_ROLE.VISITOR)];
}
