import { z } from 'zod';

/**
 * System permissions as string literals
 */
export const PermissionValues = {
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  VIEW_ALL_USER_ACTION_LOGS: 'VIEW_ALL_USER_ACTION_LOGS',
  EDIT_USER_PROFILES: 'EDIT_USER_PROFILES',
  DELETE_USER_ACCOUNTS: 'DELETE_USER_ACCOUNTS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  EXPORT_DATA: 'EXPORT_DATA',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_API_KEYS: 'MANAGE_API_KEYS',
  INVITE_USERS: 'INVITE_USERS',
  MANAGE_TEAMS: 'MANAGE_TEAMS',
  MANAGE_BILLING: 'MANAGE_BILLING',
  MANAGE_SUBSCRIPTIONS: 'MANAGE_SUBSCRIPTIONS',
} as const;

/**
 * Permission type
 */
export type Permission = typeof PermissionValues[keyof typeof PermissionValues];

/**
 * User roles in the system
 */
export const RoleValues = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
  VIEWER: 'VIEWER',
} as const;

/**
 * Role type
 */
export type Role = typeof RoleValues[keyof typeof RoleValues];

/**
 * Role-Permission mapping type
 */
export type RolePermissions = {
  [key in Role]: Permission[];
};

// Define the role schema for validation
export const roleSchema = z.object({
  id: z.string(),
  name: z.enum(Object.values(RoleValues) as [string, ...string[]]),
  description: z.string().optional(),
  permissions: z.array(z.enum(Object.values(PermissionValues) as [string, ...string[]])),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RoleSchema = z.infer<typeof roleSchema>;

// User role assignment schema
export const userRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  assignedBy: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type UserRoleSchema = z.infer<typeof userRoleSchema>;

// RBAC store state
export interface RBACState {
  roles: RoleSchema[];
  userRoles: UserRoleSchema[];
  isLoading: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  clearError: () => void;
}

// Helper type for role-based component props
export interface WithRoleProps {
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
} 