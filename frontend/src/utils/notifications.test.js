import { describe, it, expect } from 'vitest';
import { notificationLabel, unreadText } from './notifications.js';

describe('notificationLabel', () => {
  it('maps known types and falls back for unknown ones', () => {
    expect(notificationLabel('PROMOTED')).toBe('Promoted');
    expect(notificationLabel('REMINDER')).toBe('Reminder');
    expect(notificationLabel('SOMETHING')).toBe('Update');
  });
});

describe('unreadText', () => {
  it('shows the unread count in the navigation link', () => {
    expect(unreadText(0)).toBe('Notifications');
    expect(unreadText(3)).toBe('Notifications (3)');
    expect(unreadText(150)).toBe('Notifications (99+)');
  });
});
