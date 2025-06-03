/**
 * User Service Factory
 * 
 * This file exports the factory function for creating an instance of the UserService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { UserService } from '@/core/user/interfaces';
import { DefaultUserService } from './default-user.service';
export { RepositoryUserService } from './repository-user.service';
export { ApiUserService, getApiUserService } from './api-user.service';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';
import type { IUserDataProvider } from '@/core/user/IUserDataProvider';
import type { UserDataProvider } from '@/core/user/IUserDataProvider';

/**
 * Configuration options for creating a UserService
 */
export interface UserServiceConfig {
  /**
   * User data provider for database operations
   */
  userDataProvider: UserDataProvider;
}

/**
 * Create an instance of the UserService
 * 
 * @param config - Configuration options for the UserService
 * @returns An instance of the UserService
 */
export function createUserService(config: UserServiceConfig): UserService {
  return new DefaultUserService(config.userDataProvider);
}

/**
 * Default export of the user service module
 */
export default {
  createUserService
};

/**
 * Retrieve the configured UserService instance.
 *
 * This helper checks the global UserManagementConfiguration for a registered
 * `userService` implementation. If none is found, it falls back to creating a
 * DefaultUserService using the adapter registry.
 */
export function getConfiguredUserService(): UserService {
  const configured =
    UserManagementConfiguration.getServiceProvider<UserService>('userService');
  if (configured) {
    return configured;
  }

  const provider = AdapterRegistry.getInstance().getAdapter<IUserDataProvider>(
    'user'
  );
  return createUserService({ userDataProvider: provider });
}
