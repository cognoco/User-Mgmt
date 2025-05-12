import { prisma } from '@/lib/database/prisma';
import { Permission, RoleType, RoleDefinition, isPermission } from './roles';
import { TeamRole } from '@prisma/client';

/**
 * Initialize role permissions in the database
 */
export async function initializeRolePermissions() {
  // Get all existing permissions
  const existingPermissions = await prisma.rolePermission.findMany();
  const existingMap = new Map(
    existingPermissions.map(p => [`${p.role}-${p.permission}`, p])
  );

  // Create or update permissions for each role
  const updates = Object.entries(RoleDefinition).flatMap(([role, def]) => {
    return def.permissions.map(permission => {
      const key = `${role}-${permission}`;
      if (!existingMap.has(key)) {
        return prisma.rolePermission.create({
          data: {
            role: role as TeamRole,
            permission,
          },
        });
      }
      return null;
    }).filter(Boolean);
  });

  await Promise.all(updates);
}

/**
 * Get all permissions for a specific role
 */
export async function getRolePermissions(role: TeamRole): Promise<string[]> {
  const permissions = await prisma.rolePermission.findMany({
    where: { role },
    select: { permission: true },
  });
  return permissions.map(p => p.permission);
}

/**
 * Check if a role has a specific permission
 */
export async function checkRolePermission(role: TeamRole, permission: string): Promise<boolean> {
  if (!isPermission(permission)) {
    return false;
  }

  const count = await prisma.rolePermission.count({
    where: {
      role,
      permission,
    },
  });

  return count > 0;
}

/**
 * Get all roles with their permissions
 */
export async function getAllRolesWithPermissions() {
  const roles = Object.keys(RoleDefinition) as TeamRole[];
  const permissions = await Promise.all(
    roles.map(async (role) => ({
      role,
      permissions: await getRolePermissions(role),
      ...RoleDefinition[role as RoleType],
    }))
  );

  return permissions;
}

/**
 * Sync database permissions with role definitions
 * This ensures the database matches the TypeScript definitions
 */
export async function syncRolePermissions() {
  // Delete permissions that no longer exist in the definition
  await prisma.rolePermission.deleteMany({
    where: {
      OR: [
        {
          role: {
            notIn: Object.keys(RoleDefinition) as TeamRole[],
          },
        },
        {
          permission: {
            notIn: Object.values(Permission),
          },
        },
      ],
    },
  });

  // Initialize current permissions
  await initializeRolePermissions();
}