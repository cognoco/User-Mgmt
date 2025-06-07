import type { IPermissionDataProvider } from '@/src/core/permission/IPermissionDataProvider';
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface';
import type { RoleWithPermissions } from '@/src/core/permission/models';

/**
 * Database interface for permissions and roles.
 */
export interface PermissionDatabaseInterface
  extends BaseDatabaseInterface<RoleWithPermissions>, IPermissionDataProvider {}
