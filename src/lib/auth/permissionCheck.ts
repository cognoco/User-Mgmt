import { getApiPermissionService } from '@/services/permission/factory';
import { permissionCheckCache } from '@/lib/auth/permissionCache';
import type { Permission } from '@/core/permission/models';

/**
 * Unified permission checking function that handles both direct and resource permissions
 * with built-in caching.
 */
export async function checkPermission(
  userId: string,
  permission: Permission,
  resourceType?: string,
  resourceId?: string
): Promise<boolean> {
  if (!userId) return false;

  const cacheKey = `${userId}:${permission}:${resourceType || ''}:${resourceId || ''}`;

  return permissionCheckCache.getOrCreate(cacheKey, async () => {
    const service = getApiPermissionService();

    if (resourceType && resourceId) {
      return service.hasResourcePermission(
        userId,
        permission,
        resourceType,
        resourceId
      );
    }

    return service.hasPermission(userId, permission);
  });
}

/**
 * Check multiple permissions at once (any)
 */
export async function checkAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await checkPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check multiple permissions at once (all)
 */
export async function checkAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await checkPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}
