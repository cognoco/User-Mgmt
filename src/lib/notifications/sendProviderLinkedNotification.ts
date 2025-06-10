import { getApiNotificationService } from '@/services/notification/factory';
import { NotificationChannel, NotificationCategory } from '@/core/notification/models';

/**
 * Send a notification informing the user that a new OAuth provider
 * was linked to their account.
 *
 * @param userId - ID of the user to notify
 * @param provider - Provider that was linked
 */
export async function sendProviderLinkedNotification(userId: string, provider: string) {
  try {
    const notificationService = getApiNotificationService();
    await notificationService.sendNotification(userId, {
      channel: NotificationChannel.IN_APP,
      title: 'New provider linked',
      message: `A new ${provider} account was linked to your profile.`,
      category: NotificationCategory.SECURITY,
    });
  } catch (error) {
    // Log but do not block main flow
    console.error('Failed to send provider linked notification:', error);
  }
}
