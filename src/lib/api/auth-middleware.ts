import { NextRequest, NextResponse } from 'next/server';
import type { AuthService } from '@/core/auth/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthContext } from '@/lib/auth/types';

export interface AuthMiddlewareConfig {
  authService: AuthService;
  permissionService?: PermissionService;
  requireAuth?: boolean;
  requiredPermissions?: string[];
}

export type AuthHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse> | NextResponse;

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const { authService, permissionService, requireAuth = true, requiredPermissions } = config;

  return (handler: AuthHandler) => {
    return async (req: NextRequest) => {
      let context: AuthContext = {
        userId: '',
        permissions: [],
        authenticated: false,
      };

      try {
        const user = await authService.getCurrentUser();

        if (user) {
          context = {
            userId: user.id,
            authenticated: true,
            permissions: [],
          };

          if (requiredPermissions?.length && permissionService) {
            const roles = await permissionService.getUserRoles(user.id);
            const permsSet = new Set<string>();
            for (const r of roles) {
              const role = await permissionService.getRoleById(r.roleId);
              role?.permissions.forEach(p => permsSet.add(p));
            }
            const perms = Array.from(permsSet);
            context.permissions = perms;

            const hasAll = requiredPermissions.every(p => perms.includes(p));
            if (!hasAll) {
              return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
          }
        } else if (requireAuth) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } catch (error) {
        console.error('Auth middleware error:', error);
        if (requireAuth) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      return handler(req, context);
    };
  };
}
