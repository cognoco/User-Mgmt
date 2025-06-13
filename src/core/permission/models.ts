/**
 * Permission Domain Models
 * 
 * This file defines the core entities and types for the permission and role domain.
 */

import { z } from 'zod';

//
// Runtime & type-safe Permission representation
// -------------------------------------------------
// 1. We expose a **string enum** `Permission` so that
//    - `Permission.XYZ` is available at runtime (removing TS2693 errors).
//    - The enum itself doubles as the compile-time type.
// 2. For backward compatibility we retain the old `PermissionValues`
//    constant by aliasing it to the enum object.
// -------------------------------------------------

export enum Permission {
  // User Management
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  VIEW_ALL_USER_ACTION_LOGS = 'VIEW_ALL_USER_ACTION_LOGS',
  EDIT_USER_PROFILES = 'EDIT_USER_PROFILES',
  DELETE_USER_ACCOUNTS = 'DELETE_USER_ACCOUNTS',
  
  // Role Management
  MANAGE_ROLES = 'MANAGE_ROLES',
  
  // Analytics & Data
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_DATA = 'EXPORT_DATA',
  
  // System Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_API_KEYS = 'MANAGE_API_KEYS',
  
  // Team Management
  INVITE_USERS = 'INVITE_USERS',
  MANAGE_TEAMS = 'MANAGE_TEAMS',
  
  // Billing & Subscription
  MANAGE_BILLING = 'MANAGE_BILLING',
  MANAGE_SUBSCRIPTIONS = 'MANAGE_SUBSCRIPTIONS',
  VIEW_INVOICES = 'VIEW_INVOICES',
  UPDATE_SUBSCRIPTION = 'UPDATE_SUBSCRIPTION',

  // Organization Settings
  MANAGE_ORG_SETTINGS = 'MANAGE_ORG_SETTINGS',
  CONFIGURE_SSO = 'CONFIGURE_SSO',
  MANAGE_DOMAINS = 'MANAGE_DOMAINS',

  // Admin Dashboard
  ACCESS_ADMIN_DASHBOARD = 'ACCESS_ADMIN_DASHBOARD',
  VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  
  // Team Management
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  UPDATE_MEMBER_ROLE = 'UPDATE_MEMBER_ROLE',
  VIEW_TEAM_MEMBERS = 'VIEW_TEAM_MEMBERS',
  
  // Project Management
  CREATE_PROJECT = 'CREATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  VIEW_PROJECTS = 'VIEW_PROJECTS',
}

// Preserve original constant name for existing imports
export const PermissionValues = Permission;

/**
 * Zod schema for validating permissions
 */
export const PermissionSchema = z.enum(Object.values(Permission) as [string, ...string[]]);

/**
 * User roles in the system
 */
export const RoleValues = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
  VIEWER: 'VIEWER',
  BILLING_MANAGER: 'BILLING_MANAGER',
  MEMBER: 'MEMBER',
} as const;

/**
 * Type representing all possible roles
 */
export type Role = typeof RoleValues[keyof typeof RoleValues];

/**
 * Zod schema for validating roles
 */
export const RoleSchema = z.enum(Object.values(RoleValues) as [string, ...string[]]);

/**
 * Base role entity
 */
export interface RoleEntity {
  id: string;
  name: string;
  description: string;
  isSystemRole?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions extends RoleEntity {
  permissions: Permission[];
}

/**
 * User role assignment
 */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  /** Optional role name when joined from roles table */
  roleName?: string;
  role?: RoleEntity;
  assignedBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Permission assignment to a role
 */
export interface PermissionAssignment {
  id: string;
  roleId: string;
  permission: Permission;
  createdAt: Date;
}

/**
 * Payload for creating a new role
 */
export interface RoleCreationPayload {
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: Permission[];
}

/**
 * Payload for updating an existing role
 */
export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: Permission[];
}

/**
 * Role-Permission mapping type
 */
export type RolePermissionMap = {
  [key in Role]: Permission[];
};

/**
 * Default role definitions with permissions
 */
export const DefaultRoleDefinitions: RolePermissionMap = {
  SUPER_ADMIN: Object.values(Permission),
  
  ADMIN: [
    Permission.ADMIN_ACCESS,
    Permission.VIEW_ALL_USER_ACTION_LOGS,
    Permission.EDIT_USER_PROFILES,
    Permission.DELETE_USER_ACCOUNTS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_API_KEYS,
    Permission.INVITE_USERS,
    Permission.MANAGE_TEAMS,
    Permission.ACCESS_ADMIN_DASHBOARD,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.INVITE_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER,
    Permission.UPDATE_MEMBER_ROLE,
    Permission.VIEW_TEAM_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.VIEW_PROJECTS,
  ],
  
  MANAGER: [
    Permission.VIEW_ALL_USER_ACTION_LOGS,
    Permission.EDIT_USER_PROFILES,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.INVITE_USERS,
    Permission.MANAGE_TEAMS,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.INVITE_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER,
    Permission.UPDATE_MEMBER_ROLE,
    Permission.VIEW_TEAM_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.VIEW_PROJECTS,
  ],
  
  USER: [
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_TEAM_MEMBERS,
    Permission.EDIT_PROJECT,
    Permission.VIEW_PROJECTS,
  ],
  
  VIEWER: [
    Permission.VIEW_TEAM_MEMBERS,
    Permission.VIEW_PROJECTS,
  ],
  
  BILLING_MANAGER: [
    Permission.VIEW_TEAM_MEMBERS,
    Permission.MANAGE_BILLING,
    Permission.MANAGE_SUBSCRIPTIONS,
    Permission.VIEW_INVOICES,
    Permission.UPDATE_SUBSCRIPTION,
    Permission.VIEW_PROJECTS,
  ],
  
  MEMBER: [
    Permission.VIEW_TEAM_MEMBERS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PROJECTS,
    Permission.EDIT_PROJECT,
    Permission.CREATE_PROJECT,
  ],
};

/**
 * Permission assignment tied to a specific resource
 */
export interface ResourcePermission {
  /** Unique identifier */
  id: string;
  /** User that holds the permission */
  userId: string;
  /** Permission granted */
  permission: Permission;
  /** Resource type, e.g. "project" */
  resourceType: string;
  /** Resource identifier */
  resourceId: string;
  /** Date the permission was created */
  createdAt: Date;
}
