/**
 * Role Hierarchy Hook
 * 
 * This hook provides role hierarchy management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useCallback } from 'react';
import { RoleService } from '@/services/role';
import type { RoleHierarchyNode, Role } from '@/services/role';
import type { Permission } from '@/types/rbac';

interface ExtendedRoleHierarchyNode extends RoleHierarchyNode {
  permissions: Permission[];
}

/**
 * Hook for role hierarchy management functionality
 * 
 * @returns Role hierarchy state and methods
 */
export function useRoleHierarchy() {
  const roleService = new RoleService();
  
  // Local state for role hierarchy
  const [hierarchy, setHierarchy] = useState<ExtendedRoleHierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch role hierarchy with permissions
  const fetchHierarchy = useCallback(async (): Promise<ExtendedRoleHierarchyNode[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hierarchyData = await roleService.getRoleHierarchy();
      
      // Enhance hierarchy with permissions for each role
      const enhancedHierarchy = await Promise.all(
        hierarchyData.map(async (node) => {
          const permissions = await roleService.getEffectivePermissions(node.id);
          return enhanceNodeWithPermissions(node, permissions);
        })
      );
      
      setIsLoading(false);
      setHierarchy(enhancedHierarchy);
      
      return enhancedHierarchy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch role hierarchy';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [roleService]);
  
  // Helper function to enhance node and children with permissions
  const enhanceNodeWithPermissions = async (
    node: RoleHierarchyNode, 
    permissions: Permission[]
  ): Promise<ExtendedRoleHierarchyNode> => {
    const enhancedChildren = await Promise.all(
      node.children.map(async (child) => {
        const childPermissions = await roleService.getEffectivePermissions(child.id);
        return enhanceNodeWithPermissions(child, childPermissions);
      })
    );
    
    return {
      ...node,
      permissions,
      children: enhancedChildren,
    };
  };
  
  // Move a role to a new parent
  const moveRole = useCallback(async (roleId: string, newParentId: string | null): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await roleService.setParentRole(roleId, newParentId);
      
      // Refresh hierarchy after move
      await fetchHierarchy();
      
      setIsLoading(false);
      setSuccessMessage('Role moved successfully');
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move role';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [roleService, fetchHierarchy]);
  
  // Get ancestors of a role
  const getAncestors = useCallback(async (roleId: string): Promise<Role[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ancestors = await roleService.getAncestorRoles(roleId);
      
      setIsLoading(false);
      
      return ancestors;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ancestors';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [roleService]);
  
  // Get descendants of a role
  const getDescendants = useCallback(async (roleId: string): Promise<Role[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const descendants = await roleService.getDescendantRoles(roleId);
      
      setIsLoading(false);
      
      return descendants;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch descendants';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [roleService]);
  
  // Get effective permissions for a role
  const getEffectivePermissions = useCallback(async (roleId: string): Promise<Permission[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const permissions = await roleService.getEffectivePermissions(roleId);
      
      setIsLoading(false);
      
      return permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch effective permissions';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [roleService]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  return {
    // State
    hierarchy,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchHierarchy,
    moveRole,
    getAncestors,
    getDescendants,
    getEffectivePermissions,
    clearMessages,
  };
} 