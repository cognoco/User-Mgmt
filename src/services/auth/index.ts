/**
 * Authentication Service Factory
 * 
 * This file exports the factory function for creating an instance of the AuthService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from './default-auth.service';
import type { IAuthDataProvider } from '@/core/auth/IAuthDataProvider';
import type { AuthStorage } from './auth-storage';
import { BrowserAuthStorage } from './auth-storage';

/**
 * Configuration options for creating an AuthService
 */
export interface AuthServiceConfig {
  /**
   * Auth data provider for database operations
   */
  authDataProvider: IAuthDataProvider;
  storage?: AuthStorage;
}

/**
 * Create an instance of the AuthService
 * 
 * @param config - Configuration options for the AuthService
 * @returns An instance of the AuthService
 */
export function createAuthService(config: AuthServiceConfig): AuthService {
  return new DefaultAuthService(
    config.authDataProvider,
    config.storage ?? new BrowserAuthStorage()
  );
}

/**
 * Default export of the auth service module
 */
export default {
  createAuthService
};

export { BrowserAuthStorage };
export type { AuthStorage };
