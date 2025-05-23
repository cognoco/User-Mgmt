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

// Singleton instance for API routes
let webhookServiceInstance: IWebhookService | null = null;

/**
 * Get the configured webhook service instance for API routes
 * 
 * @returns Configured IWebhookService instance
 */
export function getApiWebhookService(): IWebhookService {
  if (!webhookServiceInstance) {
    const webhookDataProvider = AdapterRegistry.getInstance().getAdapter<IWebhookDataProvider>('webhook');
    webhookServiceInstance = new WebhookService(webhookDataProvider);
  }
  
  return webhookServiceInstance;
}

