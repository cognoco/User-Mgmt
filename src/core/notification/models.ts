/**
 * Notification Domain Models
 * 
 * This file defines the core entity models for the notification domain.
 * These models represent the domain objects that are used by the notification service.
 */

import { z } from 'zod';

/**
 * Notification channel types
 */
export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'inApp',
  MARKETING = 'marketing'
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Notification categories for grouping and filtering
 */
export enum NotificationCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  ACCOUNT = 'account',
  PROMOTIONAL = 'promotional',
  UPDATES = 'updates',
  ACTIVITY = 'activity',
  TEAM = 'team'
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled'
}

/**
 * Notification payload entity
 */
export interface NotificationPayload {
  /**
   * Channel to send the notification through
   */
  channel: NotificationChannel;
  
  /**
   * Notification title
   */
  title: string;
  
  /**
   * Notification message content
   */
  message: string;
  
  /**
   * Optional URL to link to when notification is clicked
   */
  actionUrl?: string;
  
  /**
   * Optional label for the action button
   */
  actionLabel?: string;
  
  /**
   * Priority level of the notification
   */
  priority?: NotificationPriority;
  
  /**
   * Category for grouping and filtering
   */
  category?: NotificationCategory;
  
  /**
   * Additional data to include with the notification
   */
  data?: Record<string, any>;
  
  /**
   * Mobile-specific fields
   */
  mobile?: {
    /**
     * Badge number to display
     */
    badge?: number;
    
    /**
     * Sound to play
     */
    sound?: string;
    
    /**
     * Android notification channel
     */
    channel?: string;
    
    /**
     * Image URL to display with the notification
     */
    imageUrl?: string;
  };
  
  /**
   * Tracking ID for analytics
   */
  trackingId?: string;
}

/**
 * Notification entity
 */
export interface Notification {
  /**
   * Unique identifier for the notification
   */
  id: string;
  
  /**
   * ID of the user the notification is for
   */
  userId: string;
  
  /**
   * Channel the notification was sent through
   */
  channel: NotificationChannel;
  
  /**
   * Notification title
   */
  title: string;
  
  /**
   * Notification message content
   */
  message: string;
  
  /**
   * Optional URL to link to when notification is clicked
   */
  actionUrl?: string;
  
  /**
   * Optional label for the action button
   */
  actionLabel?: string;
  
  /**
   * Priority level of the notification
   */
  priority: NotificationPriority;
  
  /**
   * Category for grouping and filtering
   */
  category: NotificationCategory;
  
  /**
   * Current status of the notification
   */
  status: NotificationStatus;
  
  /**
   * Whether the notification has been read
   */
  isRead: boolean;
  
  /**
   * Timestamp when the notification was created
   */
  createdAt: string;
  
  /**
   * Timestamp when the notification was sent
   */
  sentAt?: string;
  
  /**
   * Timestamp when the notification was delivered
   */
  deliveredAt?: string;
  
  /**
   * Timestamp when the notification was read
   */
  readAt?: string;
  
  /**
   * Timestamp when the notification is scheduled to be sent
   */
  scheduledFor?: string;
  
  /**
   * Additional data included with the notification
   */
  data?: Record<string, any>;
}

/**
 * Notification template entity
 */
export interface NotificationTemplate {
  /**
   * Unique identifier for the template
   */
  id?: string;
  
  /**
   * Name of the template
   */
  name: string;
  
  /**
   * Description of the template
   */
  description?: string;
  
  /**
   * Channel the template is for
   */
  channel: NotificationChannel;
  
  /**
   * Template for the notification title with placeholders
   */
  titleTemplate: string;
  
  /**
   * Template for the notification message with placeholders
   */
  messageTemplate: string;
  
  /**
   * Template for the action URL with placeholders
   */
  actionUrlTemplate?: string;
  
  /**
   * Template for the action label with placeholders
   */
  actionLabelTemplate?: string;
  
  /**
   * Priority level of notifications using this template
   */
  priority: NotificationPriority;
  
  /**
   * Category for notifications using this template
   */
  category: NotificationCategory;
  
  /**
   * Additional data templates with placeholders
   */
  dataTemplates?: Record<string, string>;
  
  /**
   * Timestamp when the template was created
   */
  createdAt?: string;
  
  /**
   * Timestamp when the template was last updated
   */
  updatedAt?: string;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  /**
   * Whether email notifications are enabled
   */
  email: boolean;
  
  /**
   * Whether push notifications are enabled
   */
  push: boolean;
  
  /**
   * Whether SMS notifications are enabled
   */
  sms: boolean;
  
  /**
   * Whether in-app notifications are enabled
   */
  inApp: boolean;
  
  /**
   * Whether marketing notifications are enabled
   */
  marketing: boolean;
  
  /**
   * Category-specific preferences
   */
  categories: {
    /**
     * Whether system notifications are enabled
     */
    system: boolean;
    
    /**
     * Whether security notifications are enabled
     */
    security: boolean;
    
    /**
     * Whether account notifications are enabled
     */
    account: boolean;
    
    /**
     * Whether promotional notifications are enabled
     */
    promotional: boolean;
    
    /**
     * Whether update notifications are enabled
     */
    updates: boolean;
    
    /**
     * Whether activity notifications are enabled
     */
    activity: boolean;
    
    /**
     * Whether team notifications are enabled
     */
    team: boolean;
  };
  
  /**
   * Quiet hours during which notifications are suppressed
   */
  quietHours?: {
    /**
     * Whether quiet hours are enabled
     */
    enabled: boolean;
    
    /**
     * Start time for quiet hours (24-hour format, e.g., "22:00")
     */
    start: string;
    
    /**
     * End time for quiet hours (24-hour format, e.g., "07:00")
     */
    end: string;
    
    /**
     * Days of the week for quiet hours (0 = Sunday, 6 = Saturday)
     */
    days: number[];
  };
  
  /**
   * Additional preference settings
   */
  settings?: Record<string, any>;
}

/**
 * Notification filter for querying notifications
 */
export interface NotificationFilter {
  /**
   * Filter by channel
   */
  channel?: NotificationChannel;
  
  /**
   * Filter by category
   */
  category?: NotificationCategory;
  
  /**
   * Filter by read status
   */
  isRead?: boolean;
  
  /**
   * Filter by status
   */
  status?: NotificationStatus;
  
  /**
   * Filter by start date (inclusive)
   */
  startDate?: string | Date;
  
  /**
   * Filter by end date (inclusive)
   */
  endDate?: string | Date;
  
  /**
   * Sort by field
   */
  sortBy?: 'createdAt' | 'sentAt' | 'priority';
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Pagination: page number (1-based)
   */
  page?: number;
  
  /**
   * Pagination: items per page
   */
  limit?: number;
}

/**
 * Batch of notifications with pagination info
 */
export interface NotificationBatch {
  /**
   * Array of notifications
   */
  notifications: Notification[];
  
  /**
   * Total number of notifications matching the filter
   */
  total: number;
  
  /**
   * Current page number
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Number of unread notifications
   */
  unreadCount: number;
}

/**
 * Result of a notification operation
 */
export interface NotificationResult {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * ID of the notification if the operation was successful
   */
  notificationId?: string;
  
  /**
   * Error message if the operation failed
   */
  error?: string;
}

/**
 * Notification delivery status
 */
export interface NotificationDeliveryStatus {
  /**
   * ID of the notification
   */
  notificationId: string;
  
  /**
   * Current status of the notification
   */
  status: NotificationStatus;
  
  /**
   * Timestamp when the notification was created
   */
  createdAt: string;
  
  /**
   * Timestamp when the notification was sent
   */
  sentAt?: string;
  
  /**
   * Timestamp when the notification was delivered
   */
  deliveredAt?: string;
  
  /**
   * Timestamp when the notification was read
   */
  readAt?: string;
  
  /**
   * Error message if delivery failed
   */
  error?: string;
  
  /**
   * Delivery attempts made
   */
  attempts?: number;
  
  /**
   * Next retry time if delivery failed
   */
  nextRetry?: string;
}

/**
 * Device registration for push notifications
 */
export interface DeviceRegistration {
  /**
   * ID of the user
   */
  userId: string;
  
  /**
   * Device token for push notifications
   */
  deviceToken: string;
  
  /**
   * Device platform
   */
  platform: 'web' | 'ios' | 'android' | 'react-native';
  
  /**
   * Device information
   */
  deviceInfo?: {
    /**
     * Device model
     */
    model?: string;
    
    /**
     * Operating system
     */
    os?: string;
    
    /**
     * Operating system version
     */
    osVersion?: string;
    
    /**
     * App version
     */
    appVersion?: string;
  };
  
  /**
   * Timestamp when the device was registered
   */
  registeredAt: string;
  
  /**
   * Timestamp when the device was last active
   */
  lastActiveAt: string;
}

// Validation schemas
export const notificationPayloadSchema = z.object({
  channel: z.nativeEnum(NotificationChannel),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  actionUrl: z.string().url('Invalid URL').optional(),
  actionLabel: z.string().optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  category: z.nativeEnum(NotificationCategory).optional(),
  data: z.record(z.any()).optional(),
  mobile: z.object({
    badge: z.number().optional(),
    sound: z.string().optional(),
    channel: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
  }).optional(),
  trackingId: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
  marketing: z.boolean(),
  categories: z.object({
    system: z.boolean(),
    security: z.boolean(),
    account: z.boolean(),
    promotional: z.boolean(),
    updates: z.boolean(),
    activity: z.boolean(),
    team: z.boolean(),
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    days: z.array(z.number().min(0).max(6)),
  }).optional(),
  settings: z.record(z.any()).optional(),
});

export const notificationTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  channel: z.nativeEnum(NotificationChannel),
  titleTemplate: z.string().min(1, 'Title template is required'),
  messageTemplate: z.string().min(1, 'Message template is required'),
  actionUrlTemplate: z.string().optional(),
  actionLabelTemplate: z.string().optional(),
  priority: z.nativeEnum(NotificationPriority),
  category: z.nativeEnum(NotificationCategory),
  dataTemplates: z.record(z.string()).optional(),
});

// Type inference from schemas
export type NotificationPayloadData = z.infer<typeof notificationPayloadSchema>;
export type NotificationPreferencesData = z.infer<typeof notificationPreferencesSchema>;
export type NotificationTemplateData = z.infer<typeof notificationTemplateSchema>;
