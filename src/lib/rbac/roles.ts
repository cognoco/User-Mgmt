import { z } from 'zod';
import {
  PermissionValues as Permission,
  type Permission as PermissionType,
} from '@/core/permission/models';

export { Permission };
export type Permission = PermissionType;

/**
 * Defines the standard roles and their associated permissions
 */
export const RoleDefinition = {
  ADMIN: {
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: Object.values(Permission) as Permission[],
  },
  
  BILLING_MANAGER: {
    name: 'Billing Manager',
    description: 'Can manage billing, subscriptions, and view team information',
    permissions: [
      Permission.VIEW_TEAM_MEMBERS,
      Permission.MANAGE_BILLING,
      Permission.VIEW_INVOICES,
      Permission.UPDATE_SUBSCRIPTION,
      Permission.VIEW_PROJECTS,
    ] as Permission[],
  },
  
  MEMBER: {
    name: 'Member',
    description: 'Standard team member with project access',
    permissions: [
      Permission.VIEW_TEAM_MEMBERS,
      Permission.VIEW_INVOICES,
      Permission.VIEW_PROJECTS,
      Permission.EDIT_PROJECT,
      Permission.CREATE_PROJECT,
    ] as Permission[],
  },
  
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to projects and team information',
    permissions: [
      Permission.VIEW_TEAM_MEMBERS,
      Permission.VIEW_PROJECTS,
    ] as Permission[],
  },
} as const;

export type RoleType = keyof typeof RoleDefinition;

/**
 * Zod schema for validating role types
 */
export const roleSchema = z.enum(['ADMIN', 'BILLING_MANAGER', 'MEMBER', 'VIEWER']);

/**
 * Type guard to check if a string is a valid Permission
 */
export function isPermission(value: string): value is Permission {
  return Object.values(Permission).includes(value as Permission);
}

/**
 * Type guard to check if a string is a valid RoleType
 */
export function isRole(value: string): value is RoleType {
  return Object.keys(RoleDefinition).includes(value as RoleType);
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: RoleType): Permission[] {
  return Array.from(RoleDefinition[role].permissions);
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