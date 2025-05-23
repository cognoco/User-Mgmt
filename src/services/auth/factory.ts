/**
 * Auth Service Factory for API Routes
 * 
 * This file provides factory functions for creating auth services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AuthService } from '@/core/auth/interfaces';
import type { IAuthDataProvider } from '@/core/auth/IAuthDataProvider';
import { DefaultAuthService } from './default-auth.service';
import { AdapterRegistry } from '@/adapters/registry';

/**
 * Get a configured auth service instance for API routes
 *
 * @returns New AuthService instance
 */
export function getApiAuthService(): AuthService {
  const authDataProvider =
    AdapterRegistry.getInstance().getAdapter<IAuthDataProvider>('auth');

  return new DefaultAuthService(authDataProvider);
}
