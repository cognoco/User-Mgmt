import { useEffect } from 'react';
import { useRBACStore } from '@/lib/stores/rbac.store';
import { WithRoleProps } from '@/types/rbac';
import { useAuthStore } from '@/lib/stores/auth.store';

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole, requiredPermissions, fallback }: WithRoleProps = {}
) {
  return function WithRoleComponent(props: P) {
    // Update to use individual selectors for React 19 compatibility
    const hasRole = useRBACStore(state => state.hasRole);
    const hasPermission = useRBACStore(state => state.hasPermission);
    const fetchUserRoles = useRBACStore(state => state.fetchUserRoles);
    
    // Use a single primitive selector for the user
    const user = useAuthStore(state => state.user);

    useEffect(() => {
      if (user) {
        fetchUserRoles(user.id);
      }
    }, [user, fetchUserRoles]);

    // Check role requirements
    if (requiredRole && !hasRole(requiredRole)) {
      return fallback || null;
    }

    // Check permission requirements
    if (requiredPermissions?.length) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        hasPermission(permission)
      );
      if (!hasAllPermissions) {
        return fallback || null;
      }
    }

    return <WrappedComponent {...props} />;
  };
} 