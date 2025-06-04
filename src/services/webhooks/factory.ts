/**
 * Webhooks Service Factory for API Routes
 * 
 * This file provides factory functions for creating webhook services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { IWebhookService } from '@/core/webhooks';
import type { IWebhookDataProvider } from '@/core/webhooks';
import { AdapterRegistry } from '@/adapters/registry';
import { WebhookService } from './WebhookService';
import { UserManagementConfiguration } from '@/core/config';
import {
  getServiceContainer,
  getServiceConfiguration,
} from '@/lib/config/service-container';

// Singleton instance for API routes
export interface ApiWebhookServiceOptions {
  /** When true, clears the cached instance. Useful for tests */
  reset?: boolean;
}

let webhookServiceInstance: IWebhookService | null = null;
let constructing = false;

/**
 * Get the configured webhook service instance for API routes
 * 
 * @returns Configured IWebhookService instance
 */
export function getApiWebhookService(
  options: ApiWebhookServiceOptions = {},
): IWebhookService | undefined {
  if (options.reset) {
    webhookServiceInstance = null;
  }

  if (!webhookServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().webhook;
      if (containerService) {
        webhookServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!webhookServiceInstance) {
    const config = getServiceConfiguration();
    if (config.featureFlags?.webhooks === false) {
      return undefined;
    }

    webhookServiceInstance =
      config.webhookService ||
      (UserManagementConfiguration.getServiceProvider('webhookService') as IWebhookService | undefined);

    if (!webhookServiceInstance) {
      const webhookDataProvider =
        AdapterRegistry.getInstance().getAdapter<IWebhookDataProvider>('webhook');
      webhookServiceInstance = new WebhookService(webhookDataProvider);
    }
  }

  return webhookServiceInstance;
}

