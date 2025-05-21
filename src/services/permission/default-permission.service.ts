/**
 * Default Permission Service Implementation
 * 
 * This file implements the PermissionService interface defined in the core layer.
 * It provides the default implementation for permission and role management operations.
 */

import { 
  PermissionService
} from '@/core/permission/interfaces';
import { 
  Permission, 
  Role, 
  RoleEntity,
  RoleWithPermissions, 
  UserRole,
  PermissionAssignment,
  RoleCreationPayload,
  RoleUpdatePayload,
  DefaultRoleDefinitions
} from '@/core/permission/models';
import {
  PermissionEventTypes,
  PermissionEventHandler
} from '@/core/permission/events';
import { translateError } from '@/lib/utils/error';
import { TypedEventEmitter } from '@/lib/utils/typed-event-emitter';

/**
 * Default implementation of the PermissionService interface
 */
export class DefaultPermissionService
  extends TypedEventEmitter<PermissionEventTypes>
  implements PermissionService
{
  
  /**
   * Constructor for DefaultPermissionService
   * 
   * @param apiClient - The API client for making HTTP requests
   * @param permissionDataProvider - The data provider for permission operations
   */
  constructor(
    private apiClient: any, // This would be replaced with a proper API client interface
    private permissionDataProvider: any // This would be replaced with a proper permission data provider interface
  ) {
    super();
  }
  
  /**
   * Emit a permission event
   * 
   * @param event - The event to emit
   */
  private emitEvent(event: PermissionEventTypes): void {
    this.emit(event);
  }
  
  /**
   * Check if a user has a specific permission
   * 
   * @param userId - The user ID to check permissions for
   * @param permission - The permission to check
   * @returns A boolean indicating if the user has the permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      // Get all roles assigned to the user
      const userRoles = await this.getUserRoles(userId);
      
      // For each role, check if it has the permission
      for (const userRole of userRoles) {
        const hasPermission = await this.roleHasPermission(userRole.roleId, permission);
        if (hasPermission) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }
  
  /**
   * Check if a user has a specific role
   * 
   * @param userId - The user ID to check roles for
   * @param role - The role to check
   * @returns A boolean indicating if the user has the role
   */
  async hasRole(userId: string, role: Role): Promise<boolean> {
    try {
      // Get all roles assigned to the user
      const userRoles = await this.getUserRoles(userId);
      
      // Get the role entity for the specified role
      const roles = await this.getAllRoles();
      const roleEntity = roles.find(r => r.name === role);
      
      if (!roleEntity) {
        return false;
      }
      
      // Check if the user has the role
      return userRoles.some(userRole => userRole.roleId === roleEntity.id);
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }
  
  /**
   * Get all roles with their permissions
   * 
   * @returns An array of all roles with their permissions
   */
  async getAllRoles(): Promise<RoleWithPermissions[]> {
    try {
      const response = await this.apiClient.get('/api/roles');
      return response.data.roles;
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }
  
  /**
   * Get a specific role by ID
   * 
   * @param roleId - The ID of the role to get
   * @returns The role with its permissions, or null if not found
   */
  async getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
    try {
      const response = await this.apiClient.get(`/api/roles/${roleId}`);
      return response.data.role;
    } catch (error) {
      console.error('Error getting role by ID:', error);
      return null;
    }
  }
  
  /**
   * Create a new role
   * 
   * @param roleData - The data for the new role
   * @returns The created role with its permissions
   */
  async createRole(roleData: RoleCreationPayload): Promise<RoleWithPermissions> {
    try {
      const response = await this.apiClient.post('/api/roles', roleData);
      const role = response.data.role;
      
      // Emit role created event
      this.emitEvent({
        type: 'ROLE_CREATED',
        timestamp: new Date(),
        role
      });
      
      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');
    }
  }
  
  /**
   * Update an existing role
   * 
   * @param roleId - The ID of the role to update
   * @param roleData - The updated data for the role
   * @returns The updated role with its permissions
   */
  async updateRole(roleId: string, roleData: RoleUpdatePayload): Promise<RoleWithPermissions> {
    try {
      // Get the previous role for the event
      const previousRole = await this.getRoleById(roleId);
      
      if (!previousRole) {
        throw new Error('Role not found');
      }
      
      const response = await this.apiClient.put(`/api/roles/${roleId}`, roleData);
      const role = response.data.role;
      
      // Emit role updated event
      this.emitEvent({
        type: 'ROLE_UPDATED',
        timestamp: new Date(),
        role,
        previousRole
      });
      
      return role;
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
  }
  
  /**
   * Delete a role
   * 
   * @param roleId - The ID of the role to delete
   * @returns A boolean indicating if the deletion was successful
   */
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/api/roles/${roleId}`);
      
      // Emit role deleted event
      this.emitEvent({
        type: 'ROLE_DELETED',
        timestamp: new Date(),
        roleId
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }
  
  /**
   * Get all roles assigned to a user
   * 
   * @param userId - The ID of the user to get roles for
   * @returns An array of user role assignments
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const response = await this.apiClient.get(`/api/users/${userId}/roles`);
      return response.data.roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }
  
  /**
   * Assign a role to a user
   * 
   * @param userId - The ID of the user to assign the role to
   * @param roleId - The ID of the role to assign
   * @param assignedBy - The ID of the user assigning the role
   * @param expiresAt - Optional expiration date for the role assignment
   * @returns The created user role assignment
   */
  async assignRoleToUser(
    userId: string, 
    roleId: string, 
    assignedBy: string, 
    expiresAt?: Date
  ): Promise<UserRole> {
    try {
      const response = await this.apiClient.post(`/api/users/${userId}/roles`, {
        roleId,
        assignedBy,
        expiresAt: expiresAt?.toISOString()
      });
      
      const userRole = response.data.userRole;
      
      // Emit role assigned event
      this.emitEvent({
        type: 'ROLE_ASSIGNED',
        timestamp: new Date(),
        userRole
      });
      
      return userRole;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw new Error('Failed to assign role to user');
    }
  }
  
  /**
   * Remove a role from a user
   * 
   * @param userId - The ID of the user to remove the role from
   * @param roleId - The ID of the role to remove
   * @returns A boolean indicating if the removal was successful
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/api/users/${userId}/roles/${roleId}`);
      
      // Emit role removed event
      this.emitEvent({
        type: 'ROLE_REMOVED',
        timestamp: new Date(),
        userId,
        roleId
      });
      
      return true;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }
  
  /**
   * Check if a role has a specific permission
   * 
   * @param roleId - The ID of the role to check
   * @param permission - The permission to check for
   * @returns A boolean indicating if the role has the permission
   */
  async roleHasPermission(roleId: string, permission: Permission): Promise<boolean> {
    try {
      const permissions = await this.getRolePermissions(roleId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('Error checking role permission:', error);
      return false;
    }
  }
  
  /**
   * Add a permission to a role
   * 
   * @param roleId - The ID of the role to add the permission to
   * @param permission - The permission to add
   * @returns The updated permission assignment
   */
  async addPermissionToRole(roleId: string, permission: Permission): Promise<PermissionAssignment> {
    try {
      const response = await this.apiClient.post(`/api/roles/${roleId}/permissions`, {
        permission
      });
      
      const permissionAssignment = response.data.permissionAssignment;
      
      // Emit permission added event
      this.emitEvent({
        type: 'PERMISSION_ADDED',
        timestamp: new Date(),
        roleId,
        permission
      });
      
      return permissionAssignment;
    } catch (error) {
      console.error('Error adding permission to role:', error);
      throw new Error('Failed to add permission to role');
    }
  }
  
  /**
   * Remove a permission from a role
   * 
   * @param roleId - The ID of the role to remove the permission from
   * @param permission - The permission to remove
   * @returns A boolean indicating if the removal was successful
   */
  async removePermissionFromRole(roleId: string, permission: Permission): Promise<boolean> {
    try {
      await this.apiClient.delete(`/api/roles/${roleId}/permissions/${encodeURIComponent(permission)}`);
      
      // Emit permission removed event
      this.emitEvent({
        type: 'PERMISSION_REMOVED',
        timestamp: new Date(),
        roleId,
        permission
      });
      
      return true;
    } catch (error) {
      console.error('Error removing permission from role:', error);
      return false;
    }
  }
  
  /**
   * Get all permissions in the system
   * 
   * @returns An array of all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const response = await this.apiClient.get('/api/permissions');
      return response.data.permissions;
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  }
  
  /**
   * Get all permissions assigned to a role
   * 
   * @param roleId - The ID of the role to get permissions for
   * @returns An array of permissions assigned to the role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const response = await this.apiClient.get(`/api/roles/${roleId}/permissions`);
      return response.data.permissions;
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }
  
  /**
   * Sync role permissions with the database
   * This ensures the database matches the defined permissions
   * 
   * @returns A boolean indicating if the sync was successful
   */
  async syncRolePermissions(): Promise<boolean> {
    try {
      // Get all existing roles
      const existingRoles = await this.getAllRoles();
      
      // For each default role definition
      for (const [roleName, permissions] of Object.entries(DefaultRoleDefinitions)) {
        // Check if the role exists
        const existingRole = existingRoles.find(role => role.name === roleName);
        
        if (existingRole) {
          // Update existing role permissions
          const currentPermissions = await this.getRolePermissions(existingRole.id);
          
          // Add missing permissions
          for (const permission of permissions) {
            if (!currentPermissions.includes(permission)) {
              await this.addPermissionToRole(existingRole.id, permission);
            }
          }
          
          // Remove extra permissions
          for (const permission of currentPermissions) {
            if (!permissions.includes(permission)) {
              await this.removePermissionFromRole(existingRole.id, permission);
            }
          }
        } else {
          // Create new role with default permissions
          await this.createRole({
            name: roleName,
            description: `Default ${roleName} role`,
            permissions
          });
        }
      }
      
      // Get updated roles
      const updatedRoles = await this.getAllRoles();
      
      // Emit role permissions synced event
      this.emitEvent({
        type: 'ROLE_PERMISSIONS_SYNCED',
        timestamp: new Date(),
        roles: updatedRoles
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing role permissions:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to permission events
   * 
   * @param handler - Function to call when a permission event occurs
   * @returns Unsubscribe function
   */
  onPermissionEvent(handler: PermissionEventHandler): () => void {
    return this.on(handler);
  }
}
