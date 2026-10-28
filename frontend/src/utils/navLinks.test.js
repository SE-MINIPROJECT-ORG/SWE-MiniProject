import { describe, it, expect } from 'vitest';
import { getNavLinks } from './navLinks.js';

const labels = (role) => getNavLinks(role).map((link) => link.label);

describe('getNavLinks', () => {
  it('shows Login to a visitor', () => {
    expect(labels('VISITOR')).toEqual(['Events', 'Login']);
  });

  it('shows organizer pages only to an organizer', () => {
    expect(labels('ORGANIZER')).toContain('My Events');
    expect(labels('ATTENDEE')).not.toContain('My Events');
  });

  it('shows the admin console only to an admin', () => {
    expect(labels('ADMIN')).toContain('Admin Console');
    expect(labels('ORGANIZER')).not.toContain('Admin Console');
  });

  it('treats an unknown role like a visitor', () => {
    expect(labels('SOMETHING_ELSE')).toEqual(labels('VISITOR'));
  });
});
