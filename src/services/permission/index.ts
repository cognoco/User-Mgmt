/**
 * Permission Service Factory
 * 
 * This file exports the factory function for creating an instance of the PermissionService.
 * It follows the factory pattern to allow dependency injection and configuration.
 */

import { PermissionService } from '@/core/permission/interfaces';
import { DefaultPermissionService } from './default-permission.service';

/**
 * Configuration options for creating a PermissionService
 */
export interface PermissionServiceConfig {
  /**
   * API client for making HTTP requests
   */
  apiClient: any; // This would be replaced with a proper API client interface
  
  /**
   * Permission data provider for database operations
   */
  permissionDataProvider: any; // This would be replaced with a proper permission data provider interface
}

/**
 * Create an instance of the PermissionService
 * 
 * @param config - Configuration options for the PermissionService
 * @returns An instance of the PermissionService
 */
export function createPermissionService(config: PermissionServiceConfig): PermissionService {
  return new DefaultPermissionService(
    config.apiClient, 
    config.permissionDataProvider
  );
}

/**
 * Default export of the permission service module
 */
export default {
  createPermissionService
};
