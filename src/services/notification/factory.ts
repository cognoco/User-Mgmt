/**
 * Notifications Service Factory for API Routes
 * 
 * This file provides factory functions for creating notification services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { NotificationService } from '@/core/notification/interfaces';
import type { INotificationDataProvider } from '@/core/notification';
import { DefaultNotificationService } from './default-notification.service';
import { DefaultNotificationHandler } from './default-notification.handler';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';
import {
  getServiceContainer,
  getServiceConfiguration,
} from '@/lib/config/service-container';

// Singleton instance for API routes
export interface ApiNotificationServiceOptions {
  /** When true, clears the cached instance. Useful for tests */
  reset?: boolean;
}

let notificationServiceInstance: NotificationService | null = null;
let constructing = false;

/**
 * Get the configured notification service instance for API routes
 * 
 * @returns Configured NotificationService instance
 */
export function getApiNotificationService(
  options: ApiNotificationServiceOptions = {},
): NotificationService | undefined {
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
    const config = getServiceConfiguration();
    if (config.featureFlags?.notifications === false) {
      return undefined;
    }

    notificationServiceInstance =
      config.notificationService ||
      (UserManagementConfiguration.getServiceProvider(
        'notificationService',
      ) as NotificationService | undefined);

    if (!notificationServiceInstance) {
      const notificationDataProvider =
        AdapterRegistry.getInstance().getAdapter<INotificationDataProvider>('notification');
      const handler = new DefaultNotificationHandler();
      notificationServiceInstance = new DefaultNotificationService(
        notificationDataProvider,
        handler,
      );
    }
  }

  return notificationServiceInstance;
}
