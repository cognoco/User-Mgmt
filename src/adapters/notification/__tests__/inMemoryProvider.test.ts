import { describe, it, expect } from 'vitest';
import { InMemoryNotificationProvider } from '@/src/adapters/notification/inMemoryProvider'48;
import { NotificationChannel } from '@/core/notification/models';

describe('InMemoryNotificationProvider', () => {
  it('creates and retrieves a notification', async () => {
    const provider = new InMemoryNotificationProvider();
    const result = await provider.createNotification('user-1', {
      channel: NotificationChannel.IN_APP,
      title: 'Hi',
      message: 'Test',
    });
    expect(result.success).toBe(true);
    const notif = await provider.getNotification(result.notificationId!);
    expect(notif?.title).toBe('Hi');
  });

  it('updates user preferences', async () => {
    const provider = new InMemoryNotificationProvider();
    const prefs = await provider.updateUserPreferences('user-1', { email: false });
    expect(prefs.email).toBe(false);
    const loaded = await provider.getUserPreferences('user-1');
    expect(loaded.email).toBe(false);
  });
});
