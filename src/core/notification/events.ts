/**
 * Notification Domain Events
 * 
 * This file defines the events that can be emitted by the notification service.
 * These events allow other parts of the application to react to notification changes.
 */

import {
  Notification,
  NotificationChannel,
  NotificationPreferences
} from '@/src/core/notification/models';

/**
 * Base event interface that all notification events extend
 */
export interface NotificationEvent {
  /**
   * Type of the event
   */
  type: string;
  
  /**
   * Timestamp when the event occurred
   */
  timestamp: number;
}

/**
 * Event emitted when a notification is created
 */
export interface NotificationCreatedEvent extends NotificationEvent {
  type: 'notification_created';
  
  /**
   * The created notification
   */
  notification: Notification;
  
  /**
   * ID of the user who will receive the notification
   */
  userId: string;
}

/**
 * Event emitted when a notification is sent
 */
export interface NotificationSentEvent extends NotificationEvent {
  type: 'notification_sent';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who received the notification
   */
  userId: string;
  
  /**
   * Channel the notification was sent through
   */
  channel: NotificationChannel;
}

/**
 * Event emitted when a notification is delivered
 */
export interface NotificationDeliveredEvent extends NotificationEvent {
  type: 'notification_delivered';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who received the notification
   */
  userId: string;
  
  /**
   * Channel the notification was delivered through
   */
  channel: NotificationChannel;
}

/**
 * Event emitted when a notification is read
 */
export interface NotificationReadEvent extends NotificationEvent {
  type: 'notification_read';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who read the notification
   */
  userId: string;
}

/**
 * Event emitted when a notification fails to send
 */
export interface NotificationFailedEvent extends NotificationEvent {
  type: 'notification_failed';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who should have received the notification
   */
  userId: string;
  
  /**
   * Channel the notification was attempted to be sent through
   */
  channel: NotificationChannel;
  
  /**
   * Error message
   */
  error: string;
  
  /**
   * Whether a retry will be attempted
   */
  willRetry: boolean;
  
  /**
   * Next retry time if applicable
   */
  nextRetry?: string;
}

/**
 * Event emitted when a notification is scheduled
 */
export interface NotificationScheduledEvent extends NotificationEvent {
  type: 'notification_scheduled';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who will receive the notification
   */
  userId: string;
  
  /**
   * Time the notification is scheduled for
   */
  scheduledFor: string;
}

/**
 * Event emitted when a scheduled notification is cancelled
 */
export interface NotificationCancelledEvent extends NotificationEvent {
  type: 'notification_cancelled';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who would have received the notification
   */
  userId: string;
  
  /**
   * ID of the user who cancelled the notification
   */
  cancelledBy: string;
}

/**
 * Event emitted when a notification is deleted
 */
export interface NotificationDeletedEvent extends NotificationEvent {
  type: 'notification_deleted';
  
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * ID of the user who owned the notification
   */
  userId: string;
}

/**
 * Event emitted when a notification template is created
 */
export interface NotificationTemplateCreatedEvent extends NotificationEvent {
  type: 'notification_template_created';
  
  /**
   * ID of the template
   */
  templateId: string;
  
  /**
   * Name of the template
   */
  templateName: string;
  
  /**
   * Channel the template is for
   */
  channel: NotificationChannel;
}

/**
 * Event emitted when a notification template is updated
 */
export interface NotificationTemplateUpdatedEvent extends NotificationEvent {
  type: 'notification_template_updated';
  
  /**
   * ID of the template
   */
  templateId: string;
  
  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a notification template is deleted
 */
export interface NotificationTemplateDeletedEvent extends NotificationEvent {
  type: 'notification_template_deleted';
  
  /**
   * ID of the template
   */
  templateId: string;
}

/**
 * Event emitted when a user's notification preferences are updated
 */
export interface NotificationPreferencesUpdatedEvent extends NotificationEvent {
  type: 'notification_preferences_updated';
  
  /**
   * ID of the user
   */
  userId: string;
  
  /**
   * Updated preferences
   */
  preferences: NotificationPreferences;
  
  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a device is registered for push notifications
 */
export interface DeviceRegisteredEvent extends NotificationEvent {
  type: 'device_registered';
  
  /**
   * ID of the user
   */
  userId: string;
  
  /**
   * Device token
   */
  deviceToken: string;
  
  /**
   * Device platform
   */
  platform: 'web' | 'ios' | 'android' | 'react-native';
}

/**
 * Event emitted when a device is unregistered from push notifications
 */
export interface DeviceUnregisteredEvent extends NotificationEvent {
  type: 'device_unregistered';
  
  /**
   * ID of the user
   */
  userId: string;
  
  /**
   * Device token
   */
  deviceToken: string;
}

/**
 * Union type of all notification events
 */
export type NotificationEventType = 
  | NotificationCreatedEvent
  | NotificationSentEvent
  | NotificationDeliveredEvent
  | NotificationReadEvent
  | NotificationFailedEvent
  | NotificationScheduledEvent
  | NotificationCancelledEvent
  | NotificationDeletedEvent
  | NotificationTemplateCreatedEvent
  | NotificationTemplateUpdatedEvent
  | NotificationTemplateDeletedEvent
  | NotificationPreferencesUpdatedEvent
  | DeviceRegisteredEvent
  | DeviceUnregisteredEvent;
