/**
 * SSO Service Factory for API Routes
 * 
 * This file provides factory functions for creating SSO services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SsoService } from '@/core/sso/interfaces';
import type { ISsoDataProvider } from '@/core/sso';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultSsoService } from '@/src/services/sso/defaultSso.service'399;
import { getServiceContainer, getServiceConfiguration } from '@/lib/config/serviceContainer'459;

export interface ApiSsoServiceOptions {
  /** Reset the cached instance for testing */
  reset?: boolean;
}

const GLOBAL_CACHE_KEY = '__UM_SSO_SERVICE__';

let cachedService: SsoService | null = null;
let building = false;

/**
 * Get the configured SSO service instance for API routes
 * 
 * @returns Configured SsoService instance
 */
export function getApiSsoService(
  options: ApiSsoServiceOptions = {}
): SsoService | undefined {
  if (options.reset) {
    cachedService = null;
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as any)[GLOBAL_CACHE_KEY];
    }
  }

  if (!cachedService && typeof globalThis !== 'undefined') {
    cachedService = (globalThis as any)[GLOBAL_CACHE_KEY] as SsoService | null;
  }

  if (!cachedService && !building) {
    building = true;
    const existing = getServiceContainer().sso;
    if (existing) {
      cachedService = existing;
    }
    building = false;
  }

  if (!cachedService) {
    const config = getServiceConfiguration();
    if (config.featureFlags?.sso === false) {
      return undefined;
    }

    cachedService =
      config.ssoService ??
      new DefaultSsoService(
        AdapterRegistry.getInstance().getAdapter<ISsoDataProvider>('sso')
      );
  }

  if (cachedService && typeof globalThis !== 'undefined') {
    (globalThis as any)[GLOBAL_CACHE_KEY] = cachedService;
  }

  return cachedService;
}
