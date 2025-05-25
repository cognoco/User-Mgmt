/**
 * Permission Service Factory
 * 
 * This file exports the factory function for creating an instance of the PermissionService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { PermissionService } from '@/core/permission/interfaces';
import { DefaultPermissionService } from './default-permission.service';
import type { PermissionDataProvider } from '@/core/permission/IPermissionDataProvider';

/**
 * Configuration options for creating a PermissionService
 */
export interface PermissionServiceConfig {
  /**
   * Permission data provider for database operations
   */
  permissionDataProvider: PermissionDataProvider;
}

/**
 * Create an instance of the PermissionService
 * 
 * @param config - Configuration options for the PermissionService
 * @returns An instance of the PermissionService
 */
export function createPermissionService(config: PermissionServiceConfig): PermissionService {
  return new DefaultPermissionService(config.permissionDataProvider);
}

/**
 * Default export of the permission service module
 */
export default {
  createPermissionService
};

export type { PermissionEvent } from '@/core/permission/events';
export { PermissionEventTypes } from '@/core/permission/events';
