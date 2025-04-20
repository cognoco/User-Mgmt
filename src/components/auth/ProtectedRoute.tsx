import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useRBACStore } from '@/lib/stores/rbac.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectPath?: string;
  accessDeniedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectPath = '/login',
  accessDeniedComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { hasRole, hasPermission, fetchUserRoles, isLoading: rbacLoading } = useRBACStore();

  useEffect(() => {
    if (user) {
      fetchUserRoles(user.id);
    }
  }, [user, fetchUserRoles]);

  // Show loading state while checking authentication and permissions
  if (authLoading || rbacLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push(redirectPath);
    return null;
  }

  // Check roles if required
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return accessDeniedComponent || (
        <div className="text-center p-4">
          Access denied: Insufficient role permissions
        </div>
      );
    }
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );
    if (!hasRequiredPermissions) {
      return accessDeniedComponent || (
        <div className="text-center p-4">
          Access denied: Insufficient permissions
        </div>
      );
    }
  }

  return <>{children}</>;
} 