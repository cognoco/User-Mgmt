import type { IPermissionDataProvider } from '../../permission/IPermissionDataProvider';
import type { BaseDatabaseInterface } from './base.interface';
import type { RoleWithPermissions } from '../../permission/models';

/**
 * Database interface for permissions and roles.
 */
export interface PermissionDatabaseInterface
  extends BaseDatabaseInterface<RoleWithPermissions>, IPermissionDataProvider {}
