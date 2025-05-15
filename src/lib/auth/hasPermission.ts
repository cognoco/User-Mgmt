import { prisma } from '@/lib/database/prisma';
import { Permission } from '@/types/rbac';
import { checkRolePermission } from '@/lib/rbac/roleService';

/**
 * Check if a user has a specific permission
 * 
 * @param userId The user ID to check permissions for
 * @param permission The permission to check
 * @returns A boolean indicating if the user has the permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    // Get the user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return false;
    }

    // Check if the role has the required permission
    return await checkRolePermission(user.role, permission);
  } catch (error) {
    console.error(`Error checking permission ${permission} for user ${userId}:`, error);
    return false;
  }
} 