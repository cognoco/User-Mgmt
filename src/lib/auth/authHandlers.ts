// Create file: lib/auth/auth-handlers.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthContext } from '@/lib/auth/types';
import { createAuthMiddleware, AuthHandler } from '@/lib/auth/unifiedAuth.middleware';
import { PermissionValues } from '@/core/permission/models';

export type RouteHandler<T = any> = (
  req: NextRequest,
  context: AuthContext,
  data?: T
) => Promise<NextResponse> | NextResponse;

// Standard user route - requires authentication
export const createUserHandler = <T = any>(handler: RouteHandler<T>) => {
  return createAuthMiddleware({ requireAuth: true })(handler);
};

// Admin route - requires authentication and admin permissions
export const createAdminHandler = <T = any>(handler: RouteHandler<T>) => {
  return createAuthMiddleware({
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS]
  })(handler);
};

// Public route - doesn't require authentication but provides auth context if available
export const createPublicHandler = <T = any>(handler: RouteHandler<T>) => {
  return createAuthMiddleware({ requireAuth: false })(handler);
};

// Permission-specific route - requires specific permissions
export const createPermissionHandler = <T = any>(
  handler: RouteHandler<T>,
  permissions: string[]
) => {
  return createAuthMiddleware({
    requireAuth: true,
    requiredPermissions: permissions
  })(handler);
};
