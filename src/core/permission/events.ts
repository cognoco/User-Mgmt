/**
 * Permission Domain Events
 * 
 * This file defines events that can be emitted by the permission service.
 * These events allow other parts of the application to react to changes
 * in permissions and roles.
 */

import { Permission, Role, RoleWithPermissions, UserRole } from './models';

/**
 * Base event interface for all permission events
 */
export interface PermissionEvent {
  type: string;
  timestamp: Date;
}

/**
 * Event emitted when a role is created
 */
export interface RoleCreatedEvent extends PermissionEvent {
  type: 'ROLE_CREATED';
  role: RoleWithPermissions;
}

/**
 * Event emitted when a role is updated
 */
export interface RoleUpdatedEvent extends PermissionEvent {
  type: 'ROLE_UPDATED';
  role: RoleWithPermissions;
  previousRole: RoleWithPermissions;
}

/**
 * Event emitted when a role is deleted
 */
export interface RoleDeletedEvent extends PermissionEvent {
  type: 'ROLE_DELETED';
  roleId: string;
}

/**
 * Event emitted when a permission is added to a role
 */
export interface PermissionAddedEvent extends PermissionEvent {
  type: 'PERMISSION_ADDED';
  roleId: string;
  permission: Permission;
}

/**
 * Event emitted when a permission is removed from a role
 */
export interface PermissionRemovedEvent extends PermissionEvent {
  type: 'PERMISSION_REMOVED';
  roleId: string;
  permission: Permission;
}

/**
 * Event emitted when a role is assigned to a user
 */
export interface RoleAssignedEvent extends PermissionEvent {
  type: 'ROLE_ASSIGNED';
  userRole: UserRole;
}

/**
 * Event emitted when a role is removed from a user
 */
export interface RoleRemovedEvent extends PermissionEvent {
  type: 'ROLE_REMOVED';
  userId: string;
  roleId: string;
}

/**
 * Event emitted when role permissions are synced
 */
export interface RolePermissionsSyncedEvent extends PermissionEvent {
  type: 'ROLE_PERMISSIONS_SYNCED';
  roles: RoleWithPermissions[];
}

/**
 * Union type of all permission events
 */
export type PermissionEventTypes =
  | RoleCreatedEvent
  | RoleUpdatedEvent
  | RoleDeletedEvent
  | PermissionAddedEvent
  | PermissionRemovedEvent
  | RoleAssignedEvent
  | RoleRemovedEvent
  | RolePermissionsSyncedEvent;

/**
 * Permission event handler type
 */
export type PermissionEventHandler = (event: PermissionEventTypes) => void;

/**
 * Permission event emitter interface
 */
export interface PermissionEventEmitter {
  /**
   * Subscribe to permission events
   * 
   * @param handler Function to call when an event is emitted
   * @returns Unsubscribe function
   */
  subscribe(handler: PermissionEventHandler): () => void;
  
  /**
   * Emit a permission event
   * 
   * @param event The event to emit
   */
  emit(event: PermissionEventTypes): void;
}
