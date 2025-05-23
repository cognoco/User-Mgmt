/**
 * Authentication Service Factory
 * 
 * This file exports the factory function for creating an instance of the AuthService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { AuthService } from '@/core/auth/interfaces';
import { DefaultAuthService } from './default-auth.service';
import type { AxiosInstance } from 'axios';
import type { AuthDataProvider } from '@/core/auth/IAuthDataProvider';

/**
 * Configuration options for creating an AuthService
 */
export interface AuthServiceConfig {
  /**
   * API client for making HTTP requests
   */
  apiClient: AxiosInstance;
  
  /**
   * Auth data provider for database operations
   */
  authDataProvider: AuthDataProvider;
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
