/**
 * Notification Service Factory
 * 
 * This file exports the factory function for creating an instance of the NotificationService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { NotificationService, NotificationHandler } from '@/core/notification/interfaces';
import { DefaultNotificationService } from './default-notification-service';
import { DefaultNotificationHandler } from './default-notification.handler';
import type { AxiosInstance } from 'axios';
import type { NotificationDataProvider } from '@/adapters/notification/interfaces';

/**
 * Configuration options for creating a NotificationService
 */
export interface NotificationServiceConfig {
  /**
   * API client for making HTTP requests
   */
  apiClient: AxiosInstance;
  
  /**
   * Notification data provider for database operations
   */
  notificationDataProvider: NotificationDataProvider;
  
  /**
   * Custom notification handler (optional)
   * If not provided, DefaultNotificationHandler will be used
   */
  notificationHandler?: NotificationHandler;
}

/**
 * Create an instance of the NotificationService
 * 
 * @param config - Configuration options for the NotificationService
 * @returns An instance of the NotificationService
 */
export function createNotificationService(config: NotificationServiceConfig): NotificationService {
  // Use the provided notification handler or create a default one
  const notificationHandler = config.notificationHandler || new DefaultNotificationHandler();
  
  return new DefaultNotificationService(
    config.apiClient, 
    config.notificationDataProvider,
    notificationHandler
  );
}

/**
 * Create an instance of the NotificationHandler
 * 
 * @returns An instance of the NotificationHandler
 */
export function createNotificationHandler(): NotificationHandler {
  return new DefaultNotificationHandler();
}

/**
 * Default export of the notification service module
 */
export default {
  createNotificationService,
  createNotificationHandler
};
