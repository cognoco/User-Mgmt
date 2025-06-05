import {
  NotificationService,
  NotificationHandler,
} from '@/core/notification/interfaces';
import {
  NotificationPayload,
  NotificationPreferences,
  NotificationChannel,
  NotificationTemplate,
  NotificationResult,
  NotificationBatch,
  NotificationFilter,
  NotificationDeliveryStatus,
  NotificationCategory,
} from '@/core/notification/models';
import type { INotificationDataProvider } from '@/core/notification/INotificationDataProvider';

export class DefaultNotificationService implements NotificationService {
  private eventHandlers: Array<(event: any) => void> = [];

  constructor(private provider: INotificationDataProvider, private handler: NotificationHandler) {}

  private emitEvent(event: any): void {
    this.eventHandlers.forEach(cb => cb(event));
  }

  private isChannelEnabledForUser(prefs: NotificationPreferences, channel: NotificationChannel): boolean {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return prefs.email;
      case NotificationChannel.PUSH:
        return prefs.push;
      case NotificationChannel.SMS:
        return prefs.sms;
      case NotificationChannel.IN_APP:
        return prefs.inApp;
      case NotificationChannel.MARKETING:
        return prefs.marketing;
      default:
        return false;
    }
  }

  private isCategoryEnabledForUser(prefs: NotificationPreferences, category: NotificationCategory): boolean {
    switch (category) {
      case NotificationCategory.SYSTEM:
        return prefs.categories.system;
      case NotificationCategory.SECURITY:
        return prefs.categories.security;
      case NotificationCategory.ACCOUNT:
        return prefs.categories.account;
      case NotificationCategory.PROMOTIONAL:
        return prefs.categories.promotional;
      case NotificationCategory.UPDATES:
        return prefs.categories.updates;
      case NotificationCategory.ACTIVITY:
        return prefs.categories.activity;
      case NotificationCategory.TEAM:
        return prefs.categories.team;
      default:
        return false;
    }
  }

  async initialize(): Promise<void> {
    await this.handler.initialize();
    if (!this.handler.areNotificationsEnabled()) {
      await this.handler.requestPermission();
    }
  }

  async sendNotification(userId: string, payload: NotificationPayload): Promise<NotificationResult> {
    const prefs = await this.provider.getUserPreferences(userId);
    if (!this.isChannelEnabledForUser(prefs, payload.channel)) {
      return { success: false, error: `Notification channel ${payload.channel} is disabled for this user` };
    }
    if (payload.category && !this.isCategoryEnabledForUser(prefs, payload.category)) {
      return { success: false, error: `Notification category ${payload.category} is disabled for this user` };
    }

    const result = await this.provider.createNotification(userId, payload);

    if (result.success && payload.channel === NotificationChannel.IN_APP) {
      await this.handler.showNotification(payload);
    }

    if (result.success) {
      this.emitEvent({ type: 'notification_sent', userId, notificationId: result.notificationId, payload, timestamp: Date.now() });
    }

    return result;
  }

  async sendBulkNotification(userIds: string[], payload: NotificationPayload) {
    const result = await this.provider.createBulkNotifications(userIds, payload);
    this.emitEvent({
      type: 'bulk_notification_sent',
      timestamp: Date.now(),
      userCount: userIds.length,
      successCount: result.results.filter((r: { error?: string }) => !r.error).length,
      payload,
    });
    return result;
  }

  async scheduleNotification(userId: string, payload: NotificationPayload, scheduledTime: string | Date) {
    const result = await this.provider.scheduleNotification(userId, payload, scheduledTime);
    if (result.success) {
      this.emitEvent({ type: 'notification_scheduled', userId, notificationId: result.notificationId, payload, scheduledTime, timestamp: Date.now() });
    }
    return result;
  }

  async cancelScheduledNotification(notificationId: string) {
    const result = await this.provider.cancelScheduledNotification(notificationId);
    if (result.success) {
      this.emitEvent({ type: 'notification_cancelled', notificationId, timestamp: Date.now() });
    }
    return result;
  }

  async createTemplate(template: NotificationTemplate) {
    return this.provider.createTemplate(template);
  }

  async updateTemplate(templateId: string, update: Partial<NotificationTemplate>) {
    return this.provider.updateTemplate(templateId, update);
  }

  async deleteTemplate(templateId: string) {
    return this.provider.deleteTemplate(templateId);
  }

  async sendTemplatedNotification(userId: string, templateId: string, data: Record<string, any>) {
    const result = await this.provider.sendTemplatedNotification(userId, templateId, data);
    if (result.success) {
      this.emitEvent({ type: 'templated_notification_sent', userId, notificationId: result.notificationId, templateId, data, timestamp: Date.now() });
    }
    return result;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    return this.provider.getUserPreferences(userId);
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const updated = await this.provider.updateUserPreferences(userId, preferences);
    this.emitEvent({ type: 'notification_preferences_updated', userId, preferences: updated, timestamp: Date.now() });
    return updated;
  }

  async getUserNotifications(userId: string, filter?: NotificationFilter): Promise<NotificationBatch> {
    return this.provider.getUserNotifications(userId, filter);
  }

  async markAsRead(notificationId: string) {
    const result = await this.provider.markAsRead(notificationId);
    if (result.success) {
      this.emitEvent({ type: 'notification_read', notificationId, timestamp: Date.now() });
    }
    return result;
  }

  async markAllAsRead(userId: string, filter?: NotificationFilter) {
    const result = await this.provider.markAllAsRead(userId, filter);
    if (result.success) {
      this.emitEvent({ type: 'all_notifications_read', userId, count: result.count, timestamp: Date.now() });
    }
    return result;
  }

  async deleteNotification(notificationId: string) {
    const result = await this.provider.deleteNotification(notificationId);
    if (result.success) {
      this.emitEvent({ type: 'notification_deleted', notificationId, timestamp: Date.now() });
    }
    return result;
  }

  async getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus> {
    return this.provider.getDeliveryStatus(notificationId);
  }

  async registerDevice(userId: string, deviceToken: string, deviceInfo?: Record<string, any>) {
    const result = await this.provider.registerDevice(userId, deviceToken, deviceInfo);
    if (result.success) {
      await this.handler.registerDevice(userId);
    }
    return result;
  }

  async unregisterDevice(userId: string, deviceToken: string) {
    const result = await this.provider.unregisterDevice(userId, deviceToken);
    if (result.success) {
      await this.handler.unregisterDevice(userId);
    }
    return result;
  }

  async isChannelEnabled(userId: string, channel: NotificationChannel): Promise<boolean> {
    return this.provider.isChannelEnabled(userId, channel);
  }

  onNotificationEvent(callback: (event: any) => void): () => void {
    this.eventHandlers.push(callback);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== callback);
    };
  }
}
