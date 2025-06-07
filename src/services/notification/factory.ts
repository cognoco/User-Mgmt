/**
 * Notifications Service Factory for API Routes
 * 
 * This file provides factory functions for creating notification services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { NotificationService } from '@/core/notification/interfaces';
import type { INotificationDataProvider } from '@/core/notification';
import { DefaultNotificationService } from '@/src/services/notification/defaultNotification.service'398;
import { DefaultNotificationHandler } from '@/src/services/notification/defaultNotification.handler'476;
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';
import { getServiceContainer } from '@/lib/config/serviceContainer'672;

/** Options for {@link getApiNotificationService}. */
export interface ApiNotificationServiceOptions {
  /** When true, clears any cached instance (useful for testing). */
  reset?: boolean;
}

// Singleton instance for API routes
let notificationServiceInstance: NotificationService | null = null;
let constructing = false;

/**
 * Get the configured notification service instance for API routes
 * 
 * @returns Configured NotificationService instance
 */
export function getApiNotificationService(
  options: ApiNotificationServiceOptions = {}
): NotificationService {
  if (options.reset) {
    notificationServiceInstance = null;
  }

  if (!notificationServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().notification;
      if (containerService) {
        notificationServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!notificationServiceInstance) {
    const configuredService = UserManagementConfiguration.getServiceProvider('notificationService') as NotificationService | undefined;
    
    if (configuredService) {
      notificationServiceInstance = configuredService;
    } else {
      const notificationDataProvider = AdapterRegistry.getInstance().getAdapter<INotificationDataProvider>('notification');
      const handler = new DefaultNotificationHandler();
      notificationServiceInstance = new DefaultNotificationService(notificationDataProvider, handler);
    }
  }

  return notificationServiceInstance!;
}
