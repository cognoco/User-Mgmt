import { supabase } from '@/lib/supabase';
import type { Permission, PermissionGroup, Role, ResourcePermission } from '@/types/rbac';

export class PermissionService {
  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get all permission groups
  async getAllGroups(): Promise<PermissionGroup[]> {
    const { data, error } = await supabase
      .from('permission_groups')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Create a permission group
  async createGroup(name: string, description?: string): Promise<PermissionGroup> {
    const { data, error } = await supabase
      .from('permission_groups')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all roles with hierarchy information
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('weight', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get permissions for a role (including inherited permissions)
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Get the role and its hierarchy
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*, parent_role_id')
      .eq('id', roleId)
      .single();

    if (roleError) throw roleError;

    // Get direct permissions
    const { data: directPerms, error: directError } = await supabase
      .from('role_permissions')
      .select('permission_id, permissions(*)')
      .eq('role_id', roleId);

    if (directError) throw directError;

    // Recursive function to get parent role permissions
    const getParentPerms = async (parentId?: string): Promise<Permission[]> => {
      if (!parentId) return [];

      const { data: parentPerms, error: parentError } = await supabase
        .from('role_permissions')
        .select('permission_id, permissions(*)')
        .eq('role_id', parentId);

      if (parentError) throw parentError;

      // Get the parent role to check for its parent
      const { data: parentRole, error: parentRoleError } = await supabase
        .from('roles')
        .select('parent_role_id')
        .eq('id', parentId)
        .single();

      if (parentRoleError) throw parentRoleError;

      // Recursively get permissions from higher up the hierarchy
      const higherPerms = await getParentPerms(parentRole.parent_role_id);
      
      // Combine permissions from this level with higher levels
      return [...(parentPerms?.map(p => p.permissions) || []), ...higherPerms];
    };

    // Get inherited permissions
    const inheritedPerms = await getParentPerms(role.parent_role_id);

    // Combine direct and inherited permissions, removing duplicates
    const allPermissions = [
      ...(directPerms?.map(p => p.permissions) || []),
      ...inheritedPerms
    ];

    // Remove duplicates by permission ID
    const uniquePerms = Object.values(
      allPermissions.reduce((acc, perm) => {
        if (perm && perm.id) {
          acc[perm.id] = perm;
        }
        return acc;
      }, {} as Record<string, any>)
    );

    return uniquePerms;
  }

  // Check if user has a specific permission
  async hasPermission(userId: string, permissionName: string, resourceType?: string, resourceId?: string): Promise<boolean> {
    // Get user's roles
    const { data: userRoles, error: roleError } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', userId);
      
    if (roleError) throw roleError;
      
    if (!userRoles || userRoles.length === 0) return false;
    
    // Get permission ID
    const { data: permission, error: permError } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permissionName)
      .single();
      
    if (permError) return false; // Permission doesn't exist

    // Check for direct resource permission
    if (resourceType && resourceId) {
      const { data: resourcePerm, error: resourceError } = await supabase
        .from('resource_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('permission_id', permission.id)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .single();
        
      if (!resourceError && resourcePerm) return true;
    }

    // Check for role-based permissions
    const roleIds = await Promise.all(userRoles.map(async (userRole) => {
      const { data: role, error } = await supabase
        .from('roles')
        .select('id')
        .eq('name', userRole.role)
        .single();
        
      if (error) return null;
      return role.id;
    }));

    // Filter out null values
    const validRoleIds = roleIds.filter(id => id !== null);
    
    if (validRoleIds.length === 0) return false;

    // Check for permission in any of the user's roles
    const { data: hasRolePerm, error: rolePermError } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('permission_id', permission.id)
      .in('role_id', validRoleIds);
      
    return !rolePermError && hasRolePerm && hasRolePerm.length > 0;
  }

  // Assign permission to a role
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id: roleId, permission_id: permissionId });
      
    if (error) throw error;
  }

  // Grant resource-specific permission to a user
  async grantResourcePermission(
    userId: string, 
    permissionId: string, 
    resourceType: string, 
    resourceId: string
  ): Promise<ResourcePermission> {
    const { data, error } = await supabase
      .from('resource_permissions')
      .insert({
        user_id: userId,
        permission_id: permissionId,
        resource_type: resourceType,
        resource_id: resourceId
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

export const permissionService = new PermissionService();
