import { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getApiAuthService } from '@/services/auth/factory';
import { getApiPermissionService } from '@/services/permission/factory';
import { Permission } from '@/lib/rbac/roles';
import { ApiError } from '@/lib/api/common/apiError'351;
import { createAuthApiError } from '@/src/middleware/authErrors'407;
import { createErrorResponse } from '@/lib/api/common/responseFormatter'460;
import { validateAuthToken } from '@/src/middleware/validateAuthToken'536;

/**
 * Options for {@link withAuth} middleware.
 */
export interface WithAuthOptions {
  /** Require the authenticated user to have the `admin` role. */
  requireAdmin?: boolean;
}

/**
 * Request object extended with an authenticated user.
 */
export interface AuthenticatedRequest extends NextApiRequest {
  /** Authenticated Supabase user */
  user: User;
}

/**
 * Wrap an API route handler with authentication/authorization checks.
 *
 * The middleware verifies the `Authorization` header using Supabase. If
 * `requireAdmin` is set, the user must have an `admin` role in their
 * `app_metadata`.
 *
 * On failure it responds with `401` or `403` status codes. Unexpected errors
 * result in a `500` response.
 *
 * @param handler API route handler to execute after authentication succeeds.
 * @param options Optional middleware configuration.
 * @returns A new handler enforcing authentication.
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
  options: WithAuthOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const err = createAuthApiError('MISSING_TOKEN');
        return res.status(err.status).json(err.toResponse());
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

      const authService = getApiAuthService();
      const session = await authService.getSession(token);

      const user = session?.user as User | undefined;
      if (!user) {
        const err = createAuthApiError('INVALID_TOKEN');
        return res.status(err.status).json(err.toResponse());
      }

      if (
        options.requireAdmin &&
        (!user.app_metadata?.role || user.app_metadata.role !== 'admin')
      ) {
        const err = createAuthApiError('INSUFFICIENT_PERMISSIONS');
        return res.status(err.status).json(err.toResponse());
      }

      const authedReq = req as AuthenticatedRequest;
      authedReq.user = user;
      return handler(authedReq, res);
    } catch (err) {
      console.error('Auth middleware error:', err);
      const apiErr = new ApiError(
        'SERVER_GENERAL_001',
        err instanceof Error ? err.message : 'Server error during authentication',
        500
      );
      return res.status(apiErr.status).json(apiErr.toResponse());
    }
  };
}



/**
 * Authentication middleware for Next.js route handlers.
 */
export interface RouteAuthContext {
  userId: string | null;
  role?: string;
  permissions?: string[];
  user?: User;
}

export interface RouteAuthOptions {
  optional?: boolean;
  includeUser?: boolean;
  requiredPermissions?: Permission[];
  requiredRoles?: string[];
}

export async function withRouteAuth(
  handler: (req: NextRequest, ctx: RouteAuthContext) => Promise<NextResponse>,
  req: NextRequest,
  options: RouteAuthOptions = {}
): Promise<NextResponse> {
  try {
    const validation = await validateAuthToken(req);

    if (!validation.success) {
      if (options.optional) {
        return handler(req, { userId: null });
      }
      return createErrorResponse(validation.error!);
    }

    const user = validation.user!;

    const permissionService = getApiPermissionService();
    const roles = await permissionService.getUserRoles(user.id);
    const roleName = roles[0]?.roleName || roles[0]?.role?.name;

    const permissionsSet = new Set<string>();
    for (const r of roles) {
      const role = await permissionService.getRoleById(r.roleId);
      role?.permissions.forEach(p => permissionsSet.add(p));
    }
    const permissions = Array.from(permissionsSet);

    if (options.requiredRoles?.length) {
      const hasRole = roles.some(r =>
        options.requiredRoles!.includes(r.roleName || r.role?.name || '')
      );
      if (!hasRole) {
        const err = createAuthApiError('INSUFFICIENT_PERMISSIONS', { reason: 'role' });
        return createErrorResponse(err);
      }
    }

    if (options.requiredPermissions?.length) {
      for (const p of options.requiredPermissions) {
        const allowed = await permissionService.hasPermission(user.id, p);
        if (!allowed) {
          const err = createAuthApiError('INSUFFICIENT_PERMISSIONS', { permission: p });
          return createErrorResponse(err);
        }
      }
    }

    return await handler(req, {
      userId: user.id,
      role: roleName,
      permissions,
      user: options.includeUser ? (user as any) : undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    const serverError = new ApiError(
      'SERVER_GENERAL_001',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );

    return createErrorResponse(serverError);
  }
}

export interface AuthContext {
  userId: string;
  role: string | undefined;
  permissions: string[];
}

export async function withAuthRequest(
  req: NextRequest,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>,
  permission?: Permission
): Promise<NextResponse> {
  return withRouteAuth(
    (r, ctx) => {
      if (!ctx.userId) {
        const err = createAuthApiError('MISSING_TOKEN');
        return createErrorResponse(err);
      }

      if (permission && !ctx.permissions.includes(permission)) {
        const err = createAuthApiError('INSUFFICIENT_PERMISSIONS');
        return createErrorResponse(err);
      }

      return handler(r, {
        userId: ctx.userId,
        role: ctx.role,
        permissions: ctx.permissions,
      });
    },
    req,
    { includeUser: false, requiredPermissions: permission ? [permission] : undefined }
  );
}

