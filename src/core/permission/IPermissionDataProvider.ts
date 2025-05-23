/**
 * Permission Data Provider Interface
 *
 * Defines the contract for persistence operations related to permissions
 * and roles. Implementations of this interface handle all database
 * interactions while keeping the core business logic database agnostic.
 */

import type {
  Permission,
  Role,
  RoleWithPermissions,
  UserRole,
  PermissionAssignment,
  RoleCreationPayload,
  RoleUpdatePayload,
} from "./models";
import type { PermissionEventHandler } from "./events";

/**
 * Permission data provider interface.
 *
 * All data sources (Supabase, REST, GraphQL, etc.) must implement these
 * methods so the service layer can operate independently of the underlying
 * storage mechanism.
 */
export interface IPermissionDataProvider {
  /** Check if a user has a specific permission */
  hasPermission(userId: string, permission: Permission): Promise<boolean>;

  /** Check if a user has a specific role */
  hasRole(userId: string, role: Role): Promise<boolean>;

  /** Retrieve all roles with their permissions */
  getAllRoles(): Promise<RoleWithPermissions[]>;

  /** Get a role by its identifier */
  getRoleById(roleId: string): Promise<RoleWithPermissions | null>;

  /** Create a new role */
  createRole(roleData: RoleCreationPayload): Promise<RoleWithPermissions>;

  /** Update an existing role */
  updateRole(
    roleId: string,
    roleData: RoleUpdatePayload,
  ): Promise<RoleWithPermissions>;

  /** Delete a role */
  deleteRole(roleId: string): Promise<boolean>;

  /** Get all roles assigned to a user */
  getUserRoles(userId: string): Promise<UserRole[]>;

  /** Assign a role to a user */
  assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date,
  ): Promise<UserRole>;

  /** Remove a role from a user */
  removeRoleFromUser(userId: string, roleId: string): Promise<boolean>;

  /** Check if a role possesses a permission */
  roleHasPermission(roleId: string, permission: Permission): Promise<boolean>;

  /** Add a permission to a role */
  addPermissionToRole(
    roleId: string,
    permission: Permission,
  ): Promise<PermissionAssignment>;

  /** Remove a permission from a role */
  removePermissionFromRole(
    roleId: string,
    permission: Permission,
  ): Promise<boolean>;

  /** List all available permissions */
  getAllPermissions(): Promise<Permission[]>;

  /** List permissions assigned to a role */
  getRolePermissions(roleId: string): Promise<Permission[]>;

  /** Sync default role permissions with persistent storage */
  syncRolePermissions(): Promise<boolean>;

  /** Subscribe to permission related events */
  onPermissionEvent(handler: PermissionEventHandler): () => void;
}
