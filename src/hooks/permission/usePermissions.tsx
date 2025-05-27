/**
 * Permissions Hook
 * 
 * This hook provides permission management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { PermissionService } from '@/core/permission/interfaces';
import { 
  Permission, 
  PermissionAssignment 
} from '@/core/permission/models';
import { UserManagementConfiguration } from '@/core/config';

/**
 * Interface for permission check options
 */
export interface UsePermissionOptions {
  required: string;
  resourceId?: string;
}

/**
 * Hook for permission management functionality
 * 
 * @returns Permission management state and methods
 */
export function usePermissions() {
  // Get the permission service from the service provider registry
  const permissionService = UserManagementConfiguration.getServiceProvider<PermissionService>('permissionService');
  
  if (!permissionService) {
    throw new Error('PermissionService is not registered in the service provider registry');
  }
  
  // Local state for permissions
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user: sessionUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch all permissions
  const fetchAllPermissions = useCallback(async (): Promise<Permission[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allPermissions = await permissionService.getAllPermissions();
      
      setIsLoading(false);
      setPermissions(allPermissions);
      
      return allPermissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permissions';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [permissionService]);
  
  // Fetch role permissions
  const fetchRolePermissions = useCallback(async (roleId: string): Promise<Permission[]> => {
    if (!roleId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const rolePermissions = await permissionService.getRolePermissions(roleId);
      
      setIsLoading(false);
      
      return rolePermissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch role permissions';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [permissionService]);
  
  // Check if a role has a specific permission
  const checkRoleHasPermission = useCallback(async (roleId: string, permission: Permission): Promise<boolean> => {
    if (!roleId || !permission) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await permissionService.roleHasPermission(roleId, permission);
      
      setIsLoading(false);
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check role permission';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [permissionService]);
  
  // Check if a user has a specific permission
  const checkUserHasPermission = useCallback(async (userId: string, permission: Permission): Promise<boolean> => {
    if (!userId || !permission) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await permissionService.hasPermission(userId, permission);
      
      setIsLoading(false);
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check user permission';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [permissionService]);
  
  // Add permission to role
  const addPermissionToRole = useCallback(async (roleId: string, permission: Permission): Promise<PermissionAssignment | null> => {
    if (!roleId || !permission) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await permissionService.addPermissionToRole(roleId, permission);
      
      setIsLoading(false);
      setSuccessMessage('Permission added to role successfully');
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add permission to role';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return null;
    }
  }, [permissionService]);
  
  // Remove permission from role
  const removePermissionFromRole = useCallback(async (roleId: string, permission: Permission): Promise<boolean> => {
    if (!roleId || !permission) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await permissionService.removePermissionFromRole(roleId, permission);
      
      setIsLoading(false);
      
      if (success) {
        setSuccessMessage('Permission removed from role successfully');
      } else {
        setError('Failed to remove permission from role');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove permission from role';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [permissionService]);
  
  // Sync role permissions
  const syncRolePermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await permissionService.syncRolePermissions();
      
      setIsLoading(false);
      
      if (success) {
        setSuccessMessage('Role permissions synced successfully');
        // Refresh permissions list after sync
        fetchAllPermissions();
      } else {
        setError('Failed to sync role permissions');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync role permissions';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [permissionService, fetchAllPermissions]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // Fetch all permissions when the component mounts
  useEffect(() => {
    fetchAllPermissions();
  }, [fetchAllPermissions]);
  
  /**
   * Simple permission check function that mimics the functionality of the old usePermission hook
   * This provides backward compatibility while following the new architecture
   * 
   * @param options Permission check options
   * @returns Object containing permission check status and loading state
   */
  const checkPermission = useCallback(
    async (options: UsePermissionOptions): Promise<{
      hasPermission: boolean;
      isLoading: boolean;
    }> => {
      if (!isAuthenticated || !sessionUser?.id) {
        return { hasPermission: false, isLoading: false };
      }

      setIsLoading(true);
      try {
        const hasPermission = await permissionService.hasPermission(
          sessionUser.id,
          options.required as Permission,
        );
        setIsLoading(false);
        return { hasPermission, isLoading: false };
      } catch (error) {
        console.error('Permission check error:', error);
        setIsLoading(false);
        return { hasPermission: false, isLoading: false };
      }
    },
    [permissionService, sessionUser, isAuthenticated],
  );

  return {
    // State
    permissions,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchAllPermissions,
    fetchRolePermissions,
    checkRoleHasPermission,
    checkUserHasPermission,
    addPermissionToRole,
    removePermissionFromRole,
    syncRolePermissions,
    clearMessages,
    
    // Backward compatibility with usePermission hook
    checkPermission
  };
}

/**
 * Legacy hook for checking if a user has a specific permission
 * This is provided for backward compatibility and redirects to usePermissions
 * 
 * @param options Permission check options
 * @returns Object containing permission check status and loading state
 */
export function usePermission(options: UsePermissionOptions) {
  const permissionService =
    UserManagementConfiguration.getServiceProvider<PermissionService>(
      'permissionService',
    );
  const { user: sessionUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['permission-check', options.required, options.resourceId, sessionUser?.id],
    queryFn: async () => {
      if (!sessionUser?.id || !permissionService) return false;
      try {
        return await permissionService.hasPermission(
          sessionUser.id,
          options.required as Permission,
        );
      } catch {
        return false;
      }
    },
    enabled: isAuthenticated && !!permissionService,
  });

  return {
    hasPermission: !!data,
    isLoading: authLoading || queryLoading,
  };
}

/**
 * Higher-order component that conditionally renders based on permissions
 * This is provided for backward compatibility
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string
) {
  return function WithPermissionComponent(props: P) {
    const { hasPermission, isLoading } = usePermission({ required: permission });

    if (isLoading) {
      return <div className="animate-pulse">Loading permissions...</div>;
    }

    if (!hasPermission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default usePermissions;
