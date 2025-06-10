/**
 * Authentication Service Factory
 * 
 * This file exports the factory function for creating an instance of the AuthService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from '@/services/auth/defaultAuth.service';
import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import type { AuthStorage } from '@/services/auth/authStorage';
import { BrowserAuthStorage } from '@/services/auth/authStorage';


/**
 * Configuration options for creating an AuthService
 */
export interface AuthServiceConfig {
  /**
   * Auth data provider for database operations
   */
  authDataProvider: AuthDataProvider;
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

export type { SessionTracker, SessionTrackerDeps } from '@/services/auth/sessionTracker';
export { DefaultSessionTracker } from '@/services/auth/sessionTracker';
export type { MFAHandler } from '@/services/auth/mfaHandler';
export { DefaultMFAHandler } from '@/services/auth/mfaHandler';