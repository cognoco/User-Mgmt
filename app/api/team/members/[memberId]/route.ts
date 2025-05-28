import { type NextRequest } from 'next/server';


import { getServerSession } from '@/middleware/auth-adapter';

import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { createTeamMemberNotFoundError } from '@/lib/api/team/error-handler';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware
} from '@/middleware/createMiddlewareChain';
import type { RouteAuthContext } from '@/middleware/auth';
import { Permission } from '@/lib/rbac/roles';

const paramSchema = z.object({ memberId: z.string().uuid() });

async function handleDelete(
  _req: NextRequest,
  auth: RouteAuthContext,
  params: z.infer<typeof paramSchema>
) {
async function handleDelete(req: NextRequest, auth: RouteAuthContext) {
  // If we're using the new middleware approach, auth context is already provided
  if (!auth?.userId) {
    // Fall back to previous approach for backward compatibility
    const session = await getServerSession();
    if (!session?.user) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', 401);
    }
    
    if (!(await hasPermission(session.user.id, 'REMOVE_TEAM_MEMBER'))) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403);
    }
    
    // Set auth to use session data for the rest of the function
    auth = { userId: session.user.id, role: session.user.role };
  } else {
    // With the middleware chain approach, we still need to check permissions
    // This can be done via the Permission enum that's already imported
    if (!(auth.permissions?.includes(Permission.REMOVE_TEAM_MEMBER))) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403);
    }
  }
  
  // Continue with the rest of the function using auth.userId
  // ...
}

  const teamMember = await prisma.teamMember.findUnique({
    where: { id: params.memberId },
    include: {
      team: { include: { members: { where: { role: 'ADMIN' } } } },
    },
  });

  if (!teamMember) {
    throw createTeamMemberNotFoundError();
  }

  if (teamMember.userId === auth.userId) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Cannot remove yourself from the team', 400);
  }

  if (teamMember.role === 'ADMIN' && teamMember.team.members.length === 1) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Cannot remove the last admin from the team', 400);
  }

  await prisma.teamMember.delete({ where: { id: params.memberId } });

  return createSuccessResponse({ message: 'Team member removed successfully' });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [Permission.REMOVE_TEAM_MEMBER] })
]);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { memberId: string } }
) => middleware((r, auth) => handleDelete(r, auth, paramSchema.parse(ctx.params)))(req);
