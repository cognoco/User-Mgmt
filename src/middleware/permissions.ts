import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRolePermission } from '@/lib/rbac/roleService';

export interface PermissionCheckOptions {
  requiredPermission: string;
  resourceId?: string;
}

/**
 * Middleware to check if a user has the required permission
 * @param handler - The route handler function
 * @param options - Permission check options including required permission and optional resource ID
 */
export function withPermissionCheck(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: PermissionCheckOptions
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get user's role from the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { teamMember: true },
      });

      if (!user?.teamMember?.role) {
        return new NextResponse(JSON.stringify({ error: 'No role assigned' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check if the user's role has the required permission
      const hasPermission = await checkRolePermission(
        user.teamMember.role,
        options.requiredPermission
      );

      if (!hasPermission) {
        return new NextResponse(
          JSON.stringify({
            error: 'Insufficient permissions',
            requiredPermission: options.requiredPermission,
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // If resource-specific check is needed
      if (options.resourceId) {
        // Add resource-specific permission checks here
        // For example, checking if user belongs to the same team as the resource
        const resource = await prisma.teamMember.findUnique({
          where: { id: options.resourceId },
          select: { teamId: true },
        });

        if (resource?.teamId !== user.teamMember.teamId) {
          return new NextResponse(
            JSON.stringify({ error: 'Resource access denied' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // Cache the permission check result in the request context
      // This can be used by the handler if needed
      const requestWithContext = new Request(req.url, {
        ...req,
        headers: new Headers({
          ...req.headers,
          'x-permission-checked': 'true',
          'x-user-role': user.teamMember.role,
        }),
      });

      // Proceed with the handler if all checks pass
      return handler(requestWithContext as NextRequest);
    } catch (error) {
      console.error('Permission check error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Helper function to create a permission-protected route handler
 */
export function createProtectedHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  permission: string,
  resourceIdExtractor?: (req: NextRequest) => string | undefined
) {
  return (req: NextRequest) => {
    const resourceId = resourceIdExtractor?.(req);
    return withPermissionCheck(handler, {
      requiredPermission: permission,
      resourceId,
    })(req);
  };
}