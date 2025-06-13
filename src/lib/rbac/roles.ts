import { z } from 'zod';
import {
  PermissionValues,
  RoleValues,
  type Permission,
  type Role,
  DefaultRoleDefinitions,
} from '@/core/permission/models';

export { PermissionValues, RoleValues } from '@/core/permission/models';
export type { Permission, Role } from '@/core/permission/models';

export interface RoleInfo {
  name: string;
  description: string;
  permissions: readonly Permission[];
}

/**
 * Defines the standard roles and their associated permissions
 */
export const RoleDefinition: Record<Role, RoleInfo> = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'System owner with all permissions',
    permissions: DefaultRoleDefinitions.SUPER_ADMIN,
  },

  ADMIN: {
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: DefaultRoleDefinitions.ADMIN,
  },

  MANAGER: {
    name: 'Manager',
    description: 'Manage teams and projects',
    permissions: DefaultRoleDefinitions.MANAGER,
  },

  USER: {
    name: 'User',
    description: 'Standard authenticated user',
    permissions: DefaultRoleDefinitions.USER,
  },

  BILLING_MANAGER: {
    name: 'Billing Manager',
    description: 'Can manage billing, subscriptions, and view team information',
    permissions: DefaultRoleDefinitions.BILLING_MANAGER,
  },

  MEMBER: {
    name: 'Member',
    description: 'Standard team member with project access',
    permissions: DefaultRoleDefinitions.MEMBER,
  },

  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to projects and team information',
    permissions: DefaultRoleDefinitions.VIEWER,
  },
};

export type RoleType = keyof typeof RoleDefinition;

/**
 * Zod schema for validating role types
 */
export const roleSchema = z.enum(Object.values(RoleValues) as [string, ...string[]]);

/**
 * Type guard to check if a string is a valid Permission
 */
export function isPermission(value: string): value is Permission {
  return Object.values(PermissionValues).includes(value as Permission);
}

/**
 * Type guard to check if a string is a valid RoleType
 */
export function isRole(value: string): value is RoleType {
  return Object.values(RoleValues).includes(value as Role);
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: RoleType): readonly Permission[] {
  return RoleDefinition[role].permissions;
}

/**
 * Check if a role has a specific permission
 */
export function hasRolePermission(role: RoleType, permission: Permission): boolean {
  return RoleDefinition[role].permissions.includes(permission);
}

/**
 * Get all available roles with their descriptions
 */
export function getAllRoles() {
  return Object.entries(RoleDefinition).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description,
    permissions: value.permissions,
  }));
}