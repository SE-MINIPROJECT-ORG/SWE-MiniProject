import { describe, it, expect } from 'vitest';
import { getNavLinks, homePathForRole } from './navLinks.js';

const labels = (role) => getNavLinks(role).map((link) => link.label);

describe('getNavLinks', () => {
  it('shows Login and Sign up to a visitor', () => {
    expect(labels('VISITOR')).toEqual(['Events', 'Login', 'Sign up']);
  });

  it('shows organizer pages only to an organizer', () => {
    expect(labels('ORGANIZER')).toContain('My Events');
    expect(labels('ATTENDEE')).not.toContain('My Events');
  });

  it('shows the admin dashboard, users and categories only to an admin', () => {
    expect(labels('ADMIN')).toContain('Dashboard');
    expect(labels('ADMIN')).toContain('Categories');
    expect(labels('ADMIN')).toContain('Users');
    expect(labels('ORGANIZER')).not.toContain('Users');
    expect(labels('ORGANIZER')).not.toContain('Categories');
    expect(labels('ORGANIZER')).not.toContain('Dashboard');
  });

  it('treats an unknown role like a visitor', () => {
    expect(labels('SOMETHING_ELSE')).toEqual(labels('VISITOR'));
  });
});

describe('homePathForRole', () => {
  it('sends each role to its own dashboard', () => {
    expect(homePathForRole('ATTENDEE')).toBe('/attendee');
    expect(homePathForRole('ORGANIZER')).toBe('/organizer');
    expect(homePathForRole('ADMIN')).toBe('/admin');
    expect(homePathForRole(undefined)).toBe('/');
  });
});
