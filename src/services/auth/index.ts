/**
 * Authentication Service Factory
 * 
 * This file exports the factory function for creating an instance of the AuthService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from '@/src/services/auth/defaultAuth.service'279;
import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import type { AuthStorage } from '@/src/services/auth/authStorage'410;
import { BrowserAuthStorage } from '@/src/services/auth/authStorage'462;


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

export type { SessionTracker, SessionTrackerDeps } from '@/src/services/auth/sessionTracker'644;
export { DefaultSessionTracker } from '@/src/services/auth/sessionTracker'1357;
export type { MFAHandler } from '@/src/services/auth/mfaHandler'1417;
export { DefaultMFAHandler } from '@/src/services/auth/mfaHandler'1467;