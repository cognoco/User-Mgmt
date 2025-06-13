import { prisma } from '@/lib/database/prisma';
import { Permission, RoleType, RoleDefinition, type RoleInfo } from '@/lib/rbac/roles';
import type { Role } from '@/core/permission/models';

/**
 * Initialize role permissions in the database
 */
export async function initializeRolePermissions() {
  // Get all existing permissions
  const existingPermissions = await prisma.rolePermission.findMany();
  const existingMap = new Map(
    existingPermissions.map((p: { role: string; permission: string }) => [
      `${p.role}-${p.permission}`,
      p,
    ])
  );

  // Create or update permissions for each role
  const updates = (Object.entries(RoleDefinition) as [RoleType, RoleInfo][])
    .flatMap(([role, def]) => {
    return def.permissions.map((permission) => {
      const key = `${role}-${permission}`;
      if (!existingMap.has(key)) {
        return prisma.rolePermission.create({
          data: {
            role,
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
export async function getRolePermissions(role: RoleType): Promise<string[]> {
  const permissions = await prisma.rolePermission.findMany({
    where: { role },
    select: { permission: true },
  });
  return permissions.map((p: { permission: string }) => p.permission);
}

/**
 * Mock implementation for checking if a role has a specific permission
 * 
 * @param role The role to check
 * @param permission The permission to check for
 * @returns A boolean indicating if the role has the permission
 */
export async function checkRolePermission(
  role: Role,
  permission: Permission,
): Promise<boolean> {
  const def = RoleDefinition[role as RoleType];
  return def
    ? (def.permissions as readonly Permission[]).includes(permission)
    : false;
}

/**
 * Get all roles with their permissions
 */
export async function getAllRolesWithPermissions() {
  const roles = Object.keys(RoleDefinition) as RoleType[];
  const permissions = await Promise.all(
    roles.map(async (role) => {
      const { permissions: defaultPermissions, ...info } =
        RoleDefinition[role as RoleType];
      return {
        role,
        permissions: await getRolePermissions(role),
        ...info,
      };
    })
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
            notIn: Object.keys(RoleDefinition) as RoleType[],
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