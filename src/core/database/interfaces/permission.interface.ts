import type { IPermissionDataProvider } from '@/src/core/permission/IPermissionDataProvider'0;
import type { BaseDatabaseInterface } from '@/src/core/database/interfaces/base.interface'90;
import type { RoleWithPermissions } from '@/src/core/permission/models'154;

/**
 * Database interface for permissions and roles.
 */
export interface PermissionDatabaseInterface
  extends BaseDatabaseInterface<RoleWithPermissions>, IPermissionDataProvider {}
