export const PermissionCategory = {
  USER_MANAGEMENT: 'User Management',
  ROLE_MANAGEMENT: 'Role Management',
  ANALYTICS: 'Analytics & Data',
  SYSTEM_SETTINGS: 'System Settings',
  TEAM_MANAGEMENT: 'Team Management',
  BILLING: 'Billing & Subscription',
  ADMIN_DASHBOARD: 'Admin Dashboard',
  PROJECT_MANAGEMENT: 'Project Management',
} as const;

export type PermissionCategory = typeof PermissionCategory[keyof typeof PermissionCategory];

import { PermissionValues, Permission } from '@/core/permission/models';

export const permissionCategoryMap: Record<Permission, PermissionCategory> = {
  [PermissionValues.ADMIN_ACCESS]: PermissionCategory.USER_MANAGEMENT,
  [PermissionValues.VIEW_ALL_USER_ACTION_LOGS]: PermissionCategory.USER_MANAGEMENT,
  [PermissionValues.EDIT_USER_PROFILES]: PermissionCategory.USER_MANAGEMENT,
  [PermissionValues.DELETE_USER_ACCOUNTS]: PermissionCategory.USER_MANAGEMENT,
  [PermissionValues.MANAGE_ROLES]: PermissionCategory.ROLE_MANAGEMENT,
  [PermissionValues.VIEW_ANALYTICS]: PermissionCategory.ANALYTICS,
  [PermissionValues.EXPORT_DATA]: PermissionCategory.ANALYTICS,
  [PermissionValues.MANAGE_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
  [PermissionValues.MANAGE_API_KEYS]: PermissionCategory.SYSTEM_SETTINGS,
  [PermissionValues.MANAGE_ORG_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
  [PermissionValues.CONFIGURE_SSO]: PermissionCategory.SYSTEM_SETTINGS,
  [PermissionValues.MANAGE_DOMAINS]: PermissionCategory.SYSTEM_SETTINGS,
  [PermissionValues.INVITE_USERS]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.MANAGE_TEAMS]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.MANAGE_BILLING]: PermissionCategory.BILLING,
  [PermissionValues.MANAGE_SUBSCRIPTIONS]: PermissionCategory.BILLING,
  [PermissionValues.VIEW_INVOICES]: PermissionCategory.BILLING,
  [PermissionValues.UPDATE_SUBSCRIPTION]: PermissionCategory.BILLING,
  [PermissionValues.ACCESS_ADMIN_DASHBOARD]: PermissionCategory.ADMIN_DASHBOARD,
  [PermissionValues.VIEW_ADMIN_DASHBOARD]: PermissionCategory.ADMIN_DASHBOARD,
  [PermissionValues.VIEW_AUDIT_LOGS]: PermissionCategory.ADMIN_DASHBOARD,
  [PermissionValues.INVITE_TEAM_MEMBER]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.REMOVE_TEAM_MEMBER]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.UPDATE_MEMBER_ROLE]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.VIEW_TEAM_MEMBERS]: PermissionCategory.TEAM_MANAGEMENT,
  [PermissionValues.CREATE_PROJECT]: PermissionCategory.PROJECT_MANAGEMENT,
  [PermissionValues.DELETE_PROJECT]: PermissionCategory.PROJECT_MANAGEMENT,
  [PermissionValues.EDIT_PROJECT]: PermissionCategory.PROJECT_MANAGEMENT,
  [PermissionValues.VIEW_PROJECTS]: PermissionCategory.PROJECT_MANAGEMENT,
};

export function listPermissionCategories(): PermissionCategory[] {
  return Array.from(new Set(Object.values(permissionCategoryMap)));
}
