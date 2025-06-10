/**
 * Session Service Factory for API Routes
 * 
 * This file provides factory functions for creating session services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SessionService } from '@/core/session/interfaces';
import type { ISessionDataProvider } from '@/core/session';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultSessionService } from '@/services/session/defaultSession.service';
import { getServiceContainer, getServiceConfiguration } from '@/lib/config/serviceContainer';

export interface ApiSessionServiceOptions {
  /** Reset the cached instance, used in tests */
  reset?: boolean;
}

const GLOBAL_CACHE_KEY = '__UM_SESSION_SERVICE__';

let cachedService: SessionService | null = null;
let building = false;

/**
 * Get the configured session service instance for API routes
 * 
 * @returns Configured SessionService instance
 */
export function getApiSessionService(
  options: ApiSessionServiceOptions = {}
): SessionService | undefined {
  if (options.reset) {
    cachedService = null;
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as any)[GLOBAL_CACHE_KEY];
    }
  }

  if (!cachedService && typeof globalThis !== 'undefined') {
    cachedService = (globalThis as any)[GLOBAL_CACHE_KEY] as SessionService | null;
  }

  if (!cachedService && !building) {
    building = true;
    const existing = getServiceContainer().session;
    if (existing) {
      cachedService = existing;
    }
    building = false;
  }

  if (!cachedService) {
    const config = getServiceConfiguration();
    if (config.featureFlags?.sessions === false) {
      return undefined;
    }

    cachedService =
      config.sessionService ??
      new DefaultSessionService(
        AdapterRegistry.getInstance().getAdapter<ISessionDataProvider>('session')
      );
  }

  if (cachedService && typeof globalThis !== 'undefined') {
    (globalThis as any)[GLOBAL_CACHE_KEY] = cachedService;
  }

  return cachedService;
}
