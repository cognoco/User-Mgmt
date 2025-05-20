/**
 * Authentication Service Factory
 * 
 * This file exports the factory function for creating an instance of the AuthService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from './default-auth.service';

/**
 * Configuration options for creating an AuthService
 */
export interface AuthServiceConfig {
  /**
   * API client for making HTTP requests
   */
  apiClient: any; // This would be replaced with a proper API client interface
  
  /**
   * Auth data provider for database operations
   */
  authDataProvider: any; // This would be replaced with a proper auth data provider interface
}

/**
 * Create an instance of the AuthService
 * 
 * @param config - Configuration options for the AuthService
 * @returns An instance of the AuthService
 */
export function createAuthService(config: AuthServiceConfig): AuthService {
  return new DefaultAuthService(config.apiClient, config.authDataProvider);
}

/**
 * Default export of the auth service module
 */
export default {
  createAuthService
};
