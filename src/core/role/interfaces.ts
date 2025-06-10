/**
 * Role Management Service Interfaces
 * 
 * This file defines the interfaces for role management functionality including
 * role creation, updating, hierarchy management, and permission assignment.
 */

import type { Permission } from '@/types/rbac';

/**
 * Role entity interface
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  parentRoleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new role
 */
export interface RoleCreateData {
  name: string;
  description?: string;
  parentRoleId?: string | null;
  isSystemRole?: boolean;
}

/**
 * Data for updating an existing role
 */
export interface RoleUpdateData {
  name?: string;
  description?: string;
  parentRoleId?: string | null;
}

/**
 * User role assignment interface
 */
export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  createdAt: string;
  expiresAt?: string | null;
  role?: Role;
}

/**
 * Role hierarchy node with children
 */
export interface RoleHierarchyNode extends Role {
  children: RoleHierarchyNode[];
}

/**
 * Filters for role queries
 */
export interface RoleFilters {
  isSystemRole?: boolean;
}

/**
 * Role service interface for managing roles, hierarchy, and permissions
 */
export interface RoleService {
  /**
   * Get all roles with optional filters
   */
  getAllRoles(filters?: RoleFilters): Promise<Role[]>;
  
  /**
   * Get a specific role by ID
   */
  getRoleById(id: string): Promise<Role | null>;
  
  /**
   * Create a new role
   */
  createRole(name: string, description?: string, parentRoleId?: string | null): Promise<Role>;
  
  /**
   * Update an existing role
   */
  updateRole(id: string, data: RoleUpdateData): Promise<Role>;
  
  /**
   * Delete a role (cannot delete system roles)
   */
  deleteRole(id: string): Promise<void>;
  
  /**
   * Get permissions assigned to a role
   */
  getRolePermissions(roleId: string): Promise<Permission[]>;
  
  /**
   * Get all roles assigned to a user
   */
  getUserRoles(userId: string): Promise<UserRoleAssignment[]>;
  
  /**
   * Set parent role for role hierarchy
   */
  setParentRole(roleId: string, parentRoleId: string | null): Promise<void>;
  
  /**
   * Remove parent role relationship
   */
  removeParentRole(roleId: string): Promise<void>;
  
  /**
   * Get all ancestor roles in the hierarchy
   */
  getAncestorRoles(roleId: string): Promise<Role[]>;
  
  /**
   * Get all descendant roles in the hierarchy
   */
  getDescendantRoles(roleId: string): Promise<Role[]>;
  
  /**
   * Get the complete role hierarchy as tree structure
   */
  getRoleHierarchy(): Promise<RoleHierarchyNode[]>;
  
  /**
   * Get effective permissions including inherited permissions from parent roles
   */
  getEffectivePermissions(roleId: string): Promise<Permission[]>;
} 