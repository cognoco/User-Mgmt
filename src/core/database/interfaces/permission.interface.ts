import type { IPermissionDataProvider } from '@/core/permission/IPermissionDataProvider';
import type { BaseDatabaseInterface } from '@/core/database/interfaces/base.interface';
import type { RoleWithPermissions } from '@/core/permission/models';

/**
 * Database interface for permissions and roles.
 */
export interface PermissionDatabaseInterface
  extends BaseDatabaseInterface<RoleWithPermissions>, IPermissionDataProvider {}
