/**
 * Notification Data Provider Interface
 *
 * This interface defines the contract for database operations
 * related to notifications and user notification preferences.
 */

import {
  NotificationPreferences,
  NotificationBatch,
  NotificationFilter
} from '../../core/notification/models';

export interface NotificationDataProvider {
  /**
   * Fetch a user's notification preferences
   */
  getUserPreferences(userId: string): Promise<NotificationPreferences>;

  /**
   * Update a user's notification preferences
   */
  updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;

  /**
   * Fetch notifications for a user
   */
  getUserNotifications(
    userId: string,
    filter?: NotificationFilter
  ): Promise<NotificationBatch>;
}
