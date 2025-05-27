import { Permission } from '@/types/rbac';
import { getApiPermissionService } from '@/services/permission/factory';

/**
 * Check if a user has a specific permission
 * 
 * @param userId The user ID to check permissions for
 * @param permission The permission to check
 * @returns A boolean indicating if the user has the permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' || process.env.E2E_TEST === 'true') {
    console.log(`[DEV/TEST] Permitting access to ${permission} for user ${userId}`);
    return true;
  }

  try {
    const service = getApiPermissionService();
    return await service.hasPermission(userId, permission as any);
  } catch (error) {
    console.error(`Error checking permission ${permission} for user ${userId}:`, error);
    return false;
  }
}
