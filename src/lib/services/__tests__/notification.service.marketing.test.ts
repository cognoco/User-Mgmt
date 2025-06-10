import { describe, it, expect, beforeEach, vi } from 'vitest';
let notificationService: typeof import('@/lib/services/notification.service').notificationService;
let notificationQueue: { enqueue: any; registerProcessor: any };

vi.mock('../notification-queue.service', () => ({
  notificationQueue: {
    enqueue: vi.fn(),
    registerProcessor: vi.fn(),
  },
}));

describe('NotificationService marketing & SMS', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ notificationService } = await import('@/lib/services/notification.service'));
    ({ notificationQueue } = await import('@/lib/services/notificationQueue.service'));
    notificationService.setConfig({
      enabled: true,
      providers: { marketing: true, sms: true },
      userPreferences: { notifications: { marketing: false } },
    });
  });

  it('respects user preference disabling marketing notifications', async () => {
    const res = await notificationService.sendMarketing('Hi', 'There');
    expect(res).toEqual({ success: false, reason: 'Disabled by user preference' });
    expect(notificationQueue.enqueue).not.toHaveBeenCalled();
  });

  it('queues SMS notifications when enabled', async () => {
    notificationService.setConfig({ userPreferences: undefined });
    (notificationQueue.enqueue as any).mockReturnValue('id1');
    const res = await notificationService.sendSMS('Code', '1234');
    expect(res).toEqual({ success: true, trackingId: 'id1' });
    expect(notificationQueue.enqueue).toHaveBeenCalledWith({ type: 'sms', title: 'Code', message: '1234', data: undefined });
  });
});
