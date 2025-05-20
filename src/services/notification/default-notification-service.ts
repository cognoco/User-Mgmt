/**
 * Default Notification Service Implementation
 * 
 * This file implements the NotificationService interface defined in the core layer.
 * It provides the default implementation for notification operations.
 */

import { 
  NotificationService,
  NotificationHandler
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
  NotificationStatus,
  NotificationCategory,
  NotificationPriority
} from '@/core/notification/models';

/**
 * Default implementation of the NotificationService interface
 */
export class DefaultNotificationService implements NotificationService {
  private eventHandlers: Array<(event: any) => void> = [];
  
  /**
   * Constructor for DefaultNotificationService
   * 
   * @param apiClient - The API client for making HTTP requests
   * @param notificationDataProvider - The data provider for notification operations
   * @param notificationHandler - The handler for displaying notifications
   */
  constructor(
    private apiClient: any, // This would be replaced with a proper API client interface
    private notificationDataProvider: any, // This would be replaced with a proper notification data provider interface
    private notificationHandler: NotificationHandler
  ) {}
  
  /**
   * Emit a notification event
   * 
   * @param event - The event to emit
   */
  private emitEvent(event: any): void {
    this.eventHandlers.forEach(handler => handler(event));
  }
  
  /**
   * Check if a notification channel is enabled for a user based on their preferences
   * 
   * @param preferences - User's notification preferences
   * @param channel - Channel to check
   * @returns True if the channel is enabled, false otherwise
   */
  private isChannelEnabledForUser(preferences: NotificationPreferences, channel: NotificationChannel): boolean {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return preferences.email;
      case NotificationChannel.PUSH:
        return preferences.push;
      case NotificationChannel.SMS:
        return preferences.sms;
      case NotificationChannel.IN_APP:
        return preferences.inApp;
      case NotificationChannel.MARKETING:
        return preferences.marketing;
      default:
        return false;
    }
  }
  
  /**
   * Check if a notification category is enabled for a user based on their preferences
   * 
   * @param preferences - User's notification preferences
   * @param category - Category to check
   * @returns True if the category is enabled, false otherwise
   */
  private isCategoryEnabledForUser(preferences: NotificationPreferences, category: NotificationCategory): boolean {
    switch (category) {
      case NotificationCategory.SYSTEM:
        return preferences.categories.system;
      case NotificationCategory.SECURITY:
        return preferences.categories.security;
      case NotificationCategory.ACCOUNT:
        return preferences.categories.account;
      case NotificationCategory.PROMOTIONAL:
        return preferences.categories.promotional;
      case NotificationCategory.UPDATES:
        return preferences.categories.updates;
      case NotificationCategory.ACTIVITY:
        return preferences.categories.activity;
      case NotificationCategory.TEAM:
        return preferences.categories.team;
      default:
        return false;
    }
  }
  
  /**
   * Initialize the notification service
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the notification handler
      await this.notificationHandler.initialize();
      
      // Request notification permission if needed
      if (!this.notificationHandler.areNotificationsEnabled()) {
        await this.notificationHandler.requestPermission();
      }
      
      // Initialize any other notification infrastructure
      // ...
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }
  
  /**
   * Send a notification to a user
   * 
   * @param userId - ID of the user to send the notification to
   * @param payload - Notification content and metadata
   * @returns Result object with success status and notification ID or error
   */
  async sendNotification(userId: string, payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Check user preferences to see if this type of notification is enabled
      const preferences = await this.getUserPreferences(userId);
      
      // Skip sending if the channel is disabled for this user
      if (!this.isChannelEnabledForUser(preferences, payload.channel)) {
        return {
          success: false,
          error: `Notification channel ${payload.channel} is disabled for this user`
        };
      }
      
      // Skip sending if the category is disabled for this user
      if (payload.category && !this.isCategoryEnabledForUser(preferences, payload.category)) {
        return {
          success: false,
          error: `Notification category ${payload.category} is disabled for this user`
        };
      }
      
      // Send the notification via API
      const response = await this.apiClient.post(`/api/users/${userId}/notifications`, payload);
      
      const notificationId = response.data.notificationId;
      
      // If it's an in-app notification, show it immediately if the user is online
      if (payload.channel === NotificationChannel.IN_APP) {
        // Show the notification using the notification handler
        this.notificationHandler.showNotification(payload);
      }
      
      // Emit notification sent event
      this.emitEvent({
        type: 'notification_sent',
        timestamp: Date.now(),
        userId,
        notificationId,
        payload
      });
      
      return {
        success: true,
        notificationId
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send notification';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Send a notification to multiple users
   * 
   * @param userIds - Array of user IDs to send the notification to
   * @param payload - Notification content and metadata
   * @returns Result object with success status, notification IDs, and any errors
   */
  async sendBulkNotification(userIds: string[], payload: NotificationPayload): Promise<{ 
    success: boolean; 
    results: { userId: string; notificationId?: string; error?: string }[]; 
  }> {
    try {
      // Send the bulk notification via API
      const response = await this.apiClient.post('/api/notifications/bulk', {
        userIds,
        payload
      });
      
      // Process the results
      const results = response.data.results;
      
      // Emit bulk notification sent event
      this.emitEvent({
        type: 'bulk_notification_sent',
        timestamp: Date.now(),
        userCount: userIds.length,
        successCount: results.filter((r: any) => !r.error).length,
        payload
      });
      
      return {
        success: true,
        results
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send bulk notification';
      
      // Return error for all users
      return {
        success: false,
        results: userIds.map(userId => ({
          userId,
          error: errorMessage
        }))
      };
    }
  }
  
  /**
   * Schedule a notification to be sent at a later time
   * 
   * @param userId - ID of the user to send the notification to
   * @param payload - Notification content and metadata
   * @param scheduledTime - Time to send the notification (ISO string or Date)
   * @returns Result object with success status and scheduled notification ID or error
   */
  async scheduleNotification(userId: string, payload: NotificationPayload, scheduledTime: string | Date): Promise<NotificationResult> {
    try {
      // Convert Date to ISO string if needed
      const scheduledTimeString = typeof scheduledTime === 'string' 
        ? scheduledTime 
        : scheduledTime.toISOString();
      
      // Schedule the notification via API
      const response = await this.apiClient.post(`/api/users/${userId}/notifications/schedule`, {
        payload,
        scheduledTime: scheduledTimeString
      });
      
      const notificationId = response.data.notificationId;
      
      // Emit notification scheduled event
      this.emitEvent({
        type: 'notification_scheduled',
        timestamp: Date.now(),
        userId,
        notificationId,
        payload,
        scheduledTime: scheduledTimeString
      });
      
      return {
        success: true,
        notificationId
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to schedule notification';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Cancel a scheduled notification
   * 
   * @param notificationId - ID of the scheduled notification to cancel
   * @returns Result object with success status or error
   */
  async cancelScheduledNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Cancel the scheduled notification via API
      await this.apiClient.delete(`/api/notifications/${notificationId}/schedule`);
      
      // Emit notification cancelled event
      this.emitEvent({
        type: 'notification_cancelled',
        timestamp: Date.now(),
        notificationId
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel scheduled notification';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Create a notification template
   * 
   * @param template - Template definition with placeholders
   * @returns Result object with success status and template ID or error
   */
  async createTemplate(template: NotificationTemplate): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      // Create the template via API
      const response = await this.apiClient.post('/api/notifications/templates', template);
      
      const templateId = response.data.templateId;
      
      return {
        success: true,
        templateId
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create notification template';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Send a notification using a template
   * 
   * @param userId - ID of the user to send the notification to
   * @param templateId - ID of the template to use
   * @param data - Data to fill template placeholders
   * @returns Result object with success status and notification ID or error
   */
  async sendTemplatedNotification(userId: string, templateId: string, data: Record<string, any>): Promise<NotificationResult> {
    try {
      // Send the templated notification via API
      const response = await this.apiClient.post(`/api/users/${userId}/notifications/templated`, {
        templateId,
        data
      });
      
      const notificationId = response.data.notificationId;
      
      // Emit templated notification sent event
      this.emitEvent({
        type: 'templated_notification_sent',
        timestamp: Date.now(),
        userId,
        notificationId,
        templateId,
        data
      });
      
      return {
        success: true,
        notificationId
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send templated notification';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get a user's notification preferences
   * 
   * @param userId - ID of the user
   * @returns User's notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await this.apiClient.get(`/api/users/${userId}/notification-preferences`);
      return response.data.preferences;
    } catch (error) {
      // Return default preferences if not found
      return {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        marketing: false,
        categories: {
          system: true,
          security: true,
          account: true,
          promotional: false,
          updates: true,
          activity: true,
          team: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
          days: [0, 1, 2, 3, 4, 5, 6] // All days of the week
        }
      };
    }
  }
  
  /**
   * Update a user's notification preferences
   * 
   * @param userId - ID of the user
   * @param preferences - Updated notification preferences
   * @returns Result object with success status and updated preferences or error
   */
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<{ 
    success: boolean; 
    preferences?: NotificationPreferences; 
    error?: string 
  }> {
    try {
      const response = await this.apiClient.put(`/api/users/${userId}/notification-preferences`, preferences);
      
      const updatedPreferences = response.data.preferences;
      
      // Emit preferences updated event
      this.emitEvent({
        type: 'notification_preferences_updated',
        timestamp: Date.now(),
        userId,
        preferences: updatedPreferences
      });
      
      return {
        success: true,
        preferences: updatedPreferences
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update notification preferences';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get notifications for a user
   * 
   * @param userId - ID of the user
   * @param filter - Optional filter criteria
   * @returns Array of notifications matching the filter
   */
  async getUserNotifications(userId: string, filter?: NotificationFilter): Promise<NotificationBatch> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            // Handle date objects
            if (value instanceof Date) {
              queryParams.append(key, value.toISOString());
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }
      
      const response = await this.apiClient.get(
        `/api/users/${userId}/notifications?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error) {
      // Return empty result on error
      return {
        notifications: [],
        total: 0,
        page: filter?.page || 1,
        limit: filter?.limit || 10,
        totalPages: 0,
        unreadCount: 0
      };
    }
  }
  
  /**
   * Mark a notification as read
   * 
   * @param notificationId - ID of the notification to mark as read
   * @returns Result object with success status or error
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.put(`/api/notifications/${notificationId}/read`);
      
      // Emit notification read event
      this.emitEvent({
        type: 'notification_read',
        timestamp: Date.now(),
        notificationId
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to mark notification as read';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * 
   * @param userId - ID of the user
   * @param filter - Optional filter to mark only specific notifications as read
   * @returns Result object with success status and count of marked notifications or error
   */
  async markAllAsRead(userId: string, filter?: NotificationFilter): Promise<{ 
    success: boolean; 
    count?: number; 
    error?: string 
  }> {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            // Handle date objects
            if (value instanceof Date) {
              queryParams.append(key, value.toISOString());
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }
      
      const response = await this.apiClient.put(
        `/api/users/${userId}/notifications/read-all?${queryParams.toString()}`
      );
      
      const count = response.data.count;
      
      // Emit all notifications read event
      this.emitEvent({
        type: 'all_notifications_read',
        timestamp: Date.now(),
        userId,
        count
      });
      
      return {
        success: true,
        count
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to mark all notifications as read';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Delete a notification
   * 
   * @param notificationId - ID of the notification to delete
   * @returns Result object with success status or error
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiClient.delete(`/api/notifications/${notificationId}`);
      
      // Emit notification deleted event
      this.emitEvent({
        type: 'notification_deleted',
        timestamp: Date.now(),
        notificationId
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete notification';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get delivery status of a notification
   * 
   * @param notificationId - ID of the notification
   * @returns Delivery status information
   */
  async getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus> {
    try {
      const response = await this.apiClient.get(`/api/notifications/${notificationId}/status`);
      return response.data.status;
    } catch (error) {
      // Return default status on error
      return {
        notificationId,
        status: NotificationStatus.FAILED,
        createdAt: new Date().toISOString(),
        error: 'Failed to get delivery status'
      };
    }
  }
  
  /**
   * Register a device for push notifications
   * 
   * @param userId - ID of the user
   * @param deviceToken - Device token for push notifications
   * @param deviceInfo - Additional device information
   * @returns Result object with success status or error
   */
  async registerDevice(userId: string, deviceToken: string, deviceInfo?: Record<string, any>): Promise<{ 
    success: boolean; 
    error?: string 
  }> {
    try {
      // Register the device with the API
      await this.apiClient.post(`/api/users/${userId}/devices`, {
        deviceToken,
        deviceInfo
      });
      
      // Register the device with the notification handler
      await this.notificationHandler.registerDevice(userId);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to register device';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Unregister a device from push notifications
   * 
   * @param userId - ID of the user
   * @param deviceToken - Device token to unregister
   * @returns Result object with success status or error
   */
  async unregisterDevice(userId: string, deviceToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Unregister the device with the API
      await this.apiClient.delete(`/api/users/${userId}/devices/${deviceToken}`);
      
      // Unregister the device with the notification handler
      await this.notificationHandler.unregisterDevice(userId);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to unregister device';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Check if a notification channel is enabled for a user
   * 
   * @param userId - ID of the user
   * @param channel - Notification channel to check
   * @returns True if the channel is enabled, false otherwise
   */
  async isChannelEnabled(userId: string, channel: NotificationChannel): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return this.isChannelEnabledForUser(preferences, channel);
    } catch (error) {
      console.error('Error checking if channel is enabled:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to notification events
   * 
   * @param callback - Function to call when a notification event occurs
   * @returns Unsubscribe function
   */
  onNotificationEvent(callback: (event: any) => void): () => void {
    this.eventHandlers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== callback);
    };
  }
}
