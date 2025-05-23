/**
 * API Keys Service Factory for API Routes
 * 
 * This file provides factory functions for creating API key services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { ApiKeyService } from '@/core/api-key/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IApiKeyDataProvider } from '@/core/api-keys';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultApiKeysService } from './default-api-keys.service';

// Singleton instance for API routes
let apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Get the configured API key service instance for API routes
 * 
 * @returns Configured ApiKeyService instance
 */
export function getApiKeyService(): ApiKeyService {
  if (!apiKeyServiceInstance) {
    apiKeyServiceInstance =
      UserManagementConfiguration.getServiceProvider('apiKeyService') as ApiKeyService | undefined;

    if (!apiKeyServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IApiKeyDataProvider>('apiKey');
      apiKeyServiceInstance = new DefaultApiKeysService(provider);
    }
  }

  return apiKeyServiceInstance;
}

/**
 * Temporary alias for backwards compatibility with older route imports.
 */
export function getApiKeysService(): ApiKeyService {
  return getApiKeyService();
}
