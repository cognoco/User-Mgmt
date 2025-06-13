import { z } from 'zod';
import {
  PermissionValues,
  PermissionSchema,
  RoleValues,
  RoleSchema,
  type Permission,
  type Role,
  type UserRole,
} from '@/core/permission/models';

export {
  PermissionValues,
  PermissionSchema,
  RoleValues,
  RoleSchema,
} from '@/core/permission/models';

// User role assignment schema
export const userRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  roleName: z.string().optional(),
  role: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      isSystemRole: z.boolean().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
    .optional(),
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

/**
 * Map of role features
 */
export interface RoleFeatures {
  [roleName: string]: {
    permissions: Permission[];
    description: string;
  };
}

// Resource-specific permission assignment
export interface ResourcePermission {
  id: string;
  userId: string;
  permissionId: string;
  resourceType: string;
  resourceId: string;
  createdAt?: string | Date;
}
