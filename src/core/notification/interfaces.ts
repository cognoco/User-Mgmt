/**
 * Notification Service Interface
 * 
 * This file defines the core interfaces for the notification domain.
 * Following the interface-first design principle, these interfaces define
 * the contract that any implementation must fulfill.
 */

import { 
  NotificationPayload,
  NotificationPreferences,
  NotificationChannel,
  NotificationTemplate,
  NotificationResult,
  NotificationBatch,
  NotificationFilter,
  NotificationDeliveryStatus
} from '@/core/notification/models';

/**
 * Core notification service interface
 * 
 * This interface defines all notification operations that can be performed.
 * Any implementation of this interface must provide all these methods.
 *
 * **Error handling:**
 * Unless otherwise specified, methods should reject their promises when
 * unexpected errors occur. Operations that return an object containing an
 * `error` field should resolve with that object for business level failures
 * rather than rejecting.
 */
export interface NotificationService {
  /**
   * Initialize the notification service
   * 
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;
  
  /**
   * Send a notification to a user
   * 
   * @param userId ID of the user to send the notification to
   * @param payload Notification content and metadata
   * @returns Result object with success status and notification ID or error
   */
  sendNotification(userId: string, payload: NotificationPayload): Promise<NotificationResult>;
  
  /**
   * Send a notification to multiple users
   * 
   * @param userIds Array of user IDs to send the notification to
   * @param payload Notification content and metadata
   * @returns Result object with success status, notification IDs, and any errors
   */
  sendBulkNotification(userIds: string[], payload: NotificationPayload): Promise<{ 
    success: boolean; 
    results: { userId: string; notificationId?: string; error?: string }[]; 
  }>;
  
  /**
   * Schedule a notification to be sent at a later time
   * 
   * @param userId ID of the user to send the notification to
   * @param payload Notification content and metadata
   * @param scheduledTime Time to send the notification (ISO string or Date)
   * @returns Result object with success status and scheduled notification ID or error
   */
  scheduleNotification(userId: string, payload: NotificationPayload, scheduledTime: string | Date): Promise<NotificationResult>;
  
  /**
   * Cancel a scheduled notification
   * 
   * @param notificationId ID of the scheduled notification to cancel
   * @returns Result object with success status or error
   */
  cancelScheduledNotification(notificationId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Create a notification template
   * 
   * @param template Template definition with placeholders
   * @returns Result object with success status and template ID or error
   */
  createTemplate(template: NotificationTemplate): Promise<{ success: boolean; templateId?: string; error?: string }>;

  /**
   * Update an existing notification template.
   *
   * @param templateId ID of the template to update
   * @param update Partial template data to store
   * @returns Result object describing success or containing error details
   */
  updateTemplate(
    templateId: string,
    update: Partial<NotificationTemplate>
  ): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }>;

  /**
   * Delete a notification template.
   *
   * @param templateId ID of the template to remove
   * @returns Result object with success flag or error information
   */
  deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Send a notification using a template
   * 
   * @param userId ID of the user to send the notification to
   * @param templateId ID of the template to use
   * @param data Data to fill template placeholders
   * @returns Result object with success status and notification ID or error
   */
  sendTemplatedNotification(userId: string, templateId: string, data: Record<string, any>): Promise<NotificationResult>;
  
  /**
   * Get a user's notification preferences
   * 
   * @param userId ID of the user
   * @returns User's notification preferences
   */
  getUserPreferences(userId: string): Promise<NotificationPreferences>;
  
  /**
   * Update a user's notification preferences
   *
   * @param userId ID of the user
   * @param preferences Updated notification preferences
   * @returns Updated preferences. The promise should reject if persistence fails.
   */
  updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;
  
  /**
   * Get notifications for a user
   * 
   * @param userId ID of the user
   * @param filter Optional filter criteria
   * @returns Array of notifications matching the filter
   */
  getUserNotifications(userId: string, filter?: NotificationFilter): Promise<NotificationBatch>;
  
  /**
   * Mark a notification as read
   * 
   * @param notificationId ID of the notification to mark as read
   * @returns Result object with success status or error
   */
  markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Mark all notifications as read for a user
   * 
   * @param userId ID of the user
   * @param filter Optional filter to mark only specific notifications as read
   * @returns Result object with success status and count of marked notifications or error
   */
  markAllAsRead(userId: string, filter?: NotificationFilter): Promise<{ 
    success: boolean; 
    count?: number; 
    error?: string 
  }>;
  
  /**
   * Delete a notification
   * 
   * @param notificationId ID of the notification to delete
   * @returns Result object with success status or error
   */
  deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Get delivery status of a notification
   * 
   * @param notificationId ID of the notification
   * @returns Delivery status information
   */
  getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus>;
  
  /**
   * Register a device for push notifications
   * 
   * @param userId ID of the user
   * @param deviceToken Device token for push notifications
   * @param deviceInfo Additional device information
   * @returns Result object with success status or error
   */
  registerDevice(userId: string, deviceToken: string, deviceInfo?: Record<string, any>): Promise<{ 
    success: boolean; 
    error?: string 
  }>;
  
  /**
   * Unregister a device from push notifications
   * 
   * @param userId ID of the user
   * @param deviceToken Device token to unregister
   * @returns Result object with success status or error
   */
  unregisterDevice(userId: string, deviceToken: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Check if a notification channel is enabled for a user
   * 
   * @param userId ID of the user
   * @param channel Notification channel to check
   * @returns True if the channel is enabled, false otherwise
   */
  isChannelEnabled(userId: string, channel: NotificationChannel): Promise<boolean>;
  
  /**
   * Subscribe to notification events
   * 
   * @param callback Function to call when a notification event occurs
   * @returns Unsubscribe function
   */
  onNotificationEvent(callback: (event: any) => void): () => void;
}

/**
 * Notification handler interface
 * 
 * This interface defines the contract for notification handling that host applications
 * should implement according to their own notification systems (FCM, APNS, web push, etc.)
 */
export interface NotificationHandler {
  /**
   * Initialize the notification system
   * Host app should implement this to set up their notification infrastructure
   */
  initialize(): Promise<void>;
  
  /**
   * Request permission to send notifications
   * Returns true if permission is granted, false otherwise
   */
  requestPermission(): Promise<boolean>;
  
  /**
   * Check if notifications are enabled for this user
   */
  areNotificationsEnabled(): boolean;
  
  /**
   * Display a notification to the user
   * @param payload The notification content
   */
  showNotification(payload: NotificationPayload): Promise<boolean>;
  
  /**
   * Associate the current device/browser with a user ID for targeted notifications
   * @param userId The user to associate with this device
   */
  registerDevice(userId: string): Promise<boolean>;
  
  /**
   * Remove association between user ID and current device/browser
   * @param userId The user to unregister from this device
   */
  unregisterDevice(userId: string): Promise<boolean>;
}

/**
 * Notification state interface
 * 
 * This interface defines the notification state that can be observed.
 */
export interface NotificationState {
  /**
   * User's notification preferences or null if not loaded
   */
  preferences: NotificationPreferences | null;
  
  /**
   * User's notifications or null if not loaded
   */
  notifications: NotificationBatch | null;
  
  /**
   * Count of unread notifications
   */
  unreadCount: number;
  
  /**
   * Whether notifications are enabled for the current user
   */
  notificationsEnabled: boolean;
  
  /**
   * True if notification operations are in progress
   */
  isLoading: boolean;
  
  /**
   * Error message if a notification operation failed
   */
  error: string | null;
  
  /**
   * Success message after a successful operation
   */
  successMessage: string | null;
}
