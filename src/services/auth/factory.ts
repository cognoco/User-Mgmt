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

// Singleton instance for API routes
let authServiceInstance: AuthService | null = null;

/**
 * Get the configured auth service instance for API routes
 * 
 * @returns Configured AuthService instance
 */
export function getApiAuthService(): AuthService {
  if (!authServiceInstance) {
    // Get the auth adapter from the registry
    const authDataProvider = AdapterRegistry.getInstance().getAdapter<IAuthDataProvider>('auth');

    // Create auth service with the adapter
    authServiceInstance = new DefaultAuthService(null as any, authDataProvider);
  }
  
  return authServiceInstance;
}
