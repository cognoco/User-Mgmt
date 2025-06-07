/**
 * Notification Data Provider Interface
 *
 * Defines the contract for persistence operations related to notifications.
 * Implementations handle data storage and retrieval so the service layer
 * remains database agnostic.
 */
import type {
  Notification,
  NotificationPayload,
  NotificationPreferences,
  NotificationTemplate,
  NotificationResult,
  NotificationBatch,
  NotificationFilter,
  NotificationDeliveryStatus,
  NotificationTemplateQuery,
  NotificationTemplateList,
  NotificationChannel
} from '@/src/core/notification/models'239;

export interface INotificationDataProvider {
  /**
   * Persist a notification for a single user.
   *
   * @param userId - ID of the user receiving the notification
   * @param payload - Notification content and metadata
   * @returns Result object with success status and notification ID or error
   */
  createNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<NotificationResult>;

  /**
   * Persist a notification for multiple users.
   *
   * @param userIds - IDs of users to receive the notification
   * @param payload - Notification content and metadata
   * @returns Result list for each user
   */
  createBulkNotifications(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<{
    success: boolean;
    results: { userId: string; notificationId?: string; error?: string }[];
  }>;

  /**
   * Schedule a notification to be sent later.
   *
   * @param userId - ID of the user receiving the notification
   * @param payload - Notification content and metadata
   * @param scheduledTime - ISO string or Date for when to send
   */
  scheduleNotification(
    userId: string,
    payload: NotificationPayload,
    scheduledTime: string | Date
  ): Promise<NotificationResult>;

  /**
   * Retrieve a notification by its identifier.
   *
   * @param notificationId - Unique identifier of the notification
   * @returns The notification or null if not found
   */
  getNotification(notificationId: string): Promise<Notification | null>;

  /**
   * Cancel a previously scheduled notification.
   *
   * @param notificationId - ID of the scheduled notification
   */
  cancelScheduledNotification(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Create a reusable notification template.
   */
  createTemplate(
    template: NotificationTemplate
  ): Promise<{ success: boolean; templateId?: string; error?: string }>;

  /**
   * Update an existing notification template.
   */
  updateTemplate(
    templateId: string,
    update: Partial<NotificationTemplate>
  ): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }>;

  /**
   * Delete a notification template.
   */
  deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * List notification templates with optional filtering and pagination.
   *
   * @param query - Filtering and pagination options
   * @returns Templates with paging information
   */
  listTemplates(
    query?: NotificationTemplateQuery
  ): Promise<NotificationTemplateList>;

  /**
   * Retrieve a notification template by id.
   *
   * @param templateId - Unique identifier of the template
   * @returns The template or null if not found
   */
  getTemplate(
    templateId: string
  ): Promise<NotificationTemplate | null>;

  /**
   * Send a notification using a template and data replacements.
   */
  sendTemplatedNotification(
    userId: string,
    templateId: string,
    data: Record<string, any>
  ): Promise<NotificationResult>;

  /**
   * Retrieve a user's notification preferences.
   */
  getUserPreferences(userId: string): Promise<NotificationPreferences>;

  /**
   * Update a user's notification preferences.
   */
  updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;

  /**
   * Fetch notifications for a user with optional filtering.
   */
  getUserNotifications(
    userId: string,
    filter?: NotificationFilter
  ): Promise<NotificationBatch>;

  /**
   * Mark a single notification as read.
   */
  markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Mark multiple notifications as read for a user.
   */
  markAllAsRead(
    userId: string,
    filter?: NotificationFilter
  ): Promise<{ success: boolean; count?: number; error?: string }>;

  /**
   * Permanently remove a notification.
   */
  deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Retrieve delivery status information for a notification.
   */
  getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus>;

  /**
   * Register a device for push notifications.
   */
  registerDevice(
    userId: string,
    deviceToken: string,
    deviceInfo?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Unregister a device from push notifications.
   */
  unregisterDevice(
    userId: string,
    deviceToken: string
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Check if a channel is enabled for the user.
   */
  isChannelEnabled(userId: string, channel: NotificationChannel): Promise<boolean>;
}
