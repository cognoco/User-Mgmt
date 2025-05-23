/**
 * SSO Service Factory for API Routes
 * 
 * This file provides factory functions for creating SSO services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SsoService } from '@/core/sso/interfaces';
import type { ISsoDataProvider } from '@/core/sso';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultSsoService } from './default-sso.service';

/**
 * Get the configured SSO service instance for API routes
 * 
 * @returns Configured SsoService instance
 */
export function getApiSsoService(): SsoService {
  const ssoDataProvider =
    AdapterRegistry.getInstance().getAdapter<ISsoDataProvider>('sso');
  return new DefaultSsoService(ssoDataProvider);
}
