import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { checkRolePermission } from '@/lib/rbac/roleService';

interface UsePermissionOptions {
  required: string;
  resourceId?: string;
}

/**
 * Hook to check if the current user has a specific permission
 * @param options - Permission check options
 * @returns Object containing permission check status and loading state
 */
export function usePermission(options: UsePermissionOptions) {
  const { data: session, status: sessionStatus } = useSession();

  const { data: hasPermission, isLoading } = useQuery({
    queryKey: ['permission', options.required, options.resourceId],
    queryFn: async () => {
      if (!session?.user) return false;

      try {
        // Fetch user's role from the API
        const response = await fetch('/api/user/role');
        if (!response.ok) return false;

        const { role } = await response.json();
        if (!role) return false;

        // Check if the role has the required permission
        return checkRolePermission(role, options.required);
      } catch (error) {
        console.error('Permission check error:', error);
        return false;
      }
    },
    enabled: sessionStatus === 'authenticated',
  });

  return {
    hasPermission: !!hasPermission,
    isLoading: sessionStatus === 'loading' || isLoading,
  };
}

/**
 * Higher-order component that conditionally renders based on permissions
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