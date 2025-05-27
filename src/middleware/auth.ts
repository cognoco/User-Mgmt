import { NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getApiAuthService, getSessionFromToken } from '@/services/auth/factory';
import { hasPermission } from '@/lib/auth/hasPermission';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';

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
        return res
          .status(401)
          .json({ error: 'Unauthorized: Missing authorization header' });
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

      const authService = getApiAuthService();
      const session = await authService.getSession(token);

      const user = session?.user as User | undefined;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      if (
        options.requireAdmin &&
        (!user.app_metadata?.role || user.app_metadata.role !== 'admin')
      ) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const authedReq = req as AuthenticatedRequest;
      authedReq.user = user;
      return handler(authedReq, res);
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  };
}



/**
 * Authentication middleware for Next.js route handlers.
 */
export async function withRouteAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getSessionFromToken(token);
    if (!user) {
      const unauthorizedError = new ApiError(
        'auth/unauthorized',
        'Authentication required',
        401
      );
      return createErrorResponse(unauthorizedError);
    }

    return await handler(req, user.id);
  } catch (error) {
    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    const serverError = new ApiError(
      'server/internal_error',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );

    return createErrorResponse(serverError);
  }
}

export interface AuthContext {
  userId: string;
  role: string;
}

export async function withAuthRequest(
  req: NextRequest,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>,
  permission?: string
): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const user = await getSessionFromToken(token);
  if (!user) {
    const err = new ApiError('auth/unauthorized', 'Authentication required', 401);
    return createErrorResponse(err);
  }

  if (permission) {
    const allowed = await hasPermission(user.id, permission as any);
    if (!allowed) {
      const err = new ApiError('auth/forbidden', 'Insufficient permissions', 403);
      return createErrorResponse(err);
    }
  }

  return handler(req, { userId: user.id, role: user.role ?? 'user' });
}

