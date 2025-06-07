/**
 * API Keys Service Factory for API Routes
 * 
 * This file provides factory functions for creating API key services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { ApiKeyService } from '@/core/apiKeys/interfaces';
import type { IApiKeyDataProvider } from '@/core/apiKeys';
import { AdapterRegistry } from '@/adapters/registry';
import { getServiceContainer } from '@/lib/config/serviceContainer';
import { DefaultApiKeysService } from '@/src/services/api-keys/defaultApiKeys.service';

export interface ApiKeysServiceOptions {
  reset?: boolean;
}

// Singleton instance for API routes
let apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Get the configured API key service instance for API routes
 * 
 * @returns Configured ApiKeyService instance
 */
export function getApiKeyService(options: ApiKeysServiceOptions = {}): ApiKeyService {
  if (options.reset) {
    apiKeyServiceInstance = null;
  }

  if (!apiKeyServiceInstance) {
    apiKeyServiceInstance = getServiceContainer().apiKey || null;
  }

  if (!apiKeyServiceInstance) {
    const provider = AdapterRegistry.getInstance().getAdapter<IApiKeyDataProvider>('apiKey');
    apiKeyServiceInstance = new DefaultApiKeysService(provider);
  }

  return apiKeyServiceInstance;
}

/**
 * Temporary alias for backwards compatibility with older route imports.
 */
export function getApiKeysService(options: ApiKeysServiceOptions = {}): ApiKeyService {
  return getApiKeyService(options);
}
