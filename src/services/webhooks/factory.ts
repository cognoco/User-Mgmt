/**
 * Webhooks Service Factory for API Routes
 * 
 * This file provides factory functions for creating webhook services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { IWebhookService } from '@/core/webhooks';
import type { IWebhookDataProvider } from '@/core/webhooks';
import { AdapterRegistry } from '@/adapters/registry';
import { WebhookService } from '@/services/webhooks/WebhookService';
import { UserManagementConfiguration } from '@/core/config';
import { getServiceContainer } from '@/lib/config/serviceContainer';

/** Options for {@link getApiWebhookService}. */
export interface ApiWebhookServiceOptions {
  /** When true, clears any cached instance (useful for testing). */
  reset?: boolean;
}

// Singleton instance for API routes
let webhookServiceInstance: IWebhookService | null = null;
let constructing = false;

/**
 * Get the configured webhook service instance for API routes
 * 
 * @returns Configured IWebhookService instance
 */
export function getApiWebhookService(
  options: ApiWebhookServiceOptions = {}
): IWebhookService {
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
    const configuredService = UserManagementConfiguration.getServiceProvider('webhookService') as IWebhookService | undefined;
    
    if (configuredService) {
      webhookServiceInstance = configuredService;
    } else {
      const webhookDataProvider = AdapterRegistry.getInstance().getAdapter<IWebhookDataProvider>('webhook');
      webhookServiceInstance = new WebhookService(webhookDataProvider);
    }
  }

  return webhookServiceInstance;
}

