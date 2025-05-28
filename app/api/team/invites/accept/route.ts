import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { getServerSession } from '@/middleware/auth-adapter';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { createTeamMemberNotFoundError } from '@/lib/api/team/error-handler';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import type { RouteAuthContext } from '@/middleware/auth';

const acceptInviteSchema = z.object({ token: z.string() });

async function handleAccept(
  req: NextRequest,
  auth?: RouteAuthContext,
  data?: z.infer<typeof acceptInviteSchema>
) {
  // Support both parameter passing approaches
  let token: string;
  let userId: string;
  let userEmail: string;
  
  // If data wasn't passed through middleware, try to get it from request body
  if (!data) {
    try {
      const body = await req.json();
      const result = acceptInviteSchema.safeParse(body);
      if (!result.success) {
        throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Invalid token', 400);
      }
      data = result.data;
    } catch (error) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Invalid request body', 400);
    }
  }
  
  token = data.token;
  
  // Support both authentication methods
  if (auth?.userId && auth.user) {
    // New middleware-based authentication
    userId = auth.userId;
    userEmail = auth.user.email || '';
  } else {
    // Legacy session-based authentication
    const session = await getServerSession();
    if (!session?.user) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', 401);
    }
    userId = session.user.id;
    userEmail = session.user.email || '';
  }

  // Continue with the invite acceptance logic using userId, userEmail, and token
  // ...
}
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized', 401);
  }

  const invite = await prisma.teamMember.findUnique({
    where: { inviteToken: data.token },
    include: { teamLicense: true },
  });
  if (!invite) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Invalid or expired invitation', 400);
  }

  if (invite.inviteExpires && invite.inviteExpires < new Date()) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Invitation has expired', 400);
  }

  if (invite.invitedEmail !== auth.user.email) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'This invitation was sent to a different email address', 403);
  }

  try {
    const updated = await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        userId: auth.userId,
        status: 'active',
        inviteToken: null,
        inviteExpires: null,
      },
    });
    return createSuccessResponse(updated);
  } catch (e) {
    throw createTeamMemberNotFoundError();
  }
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(acceptInviteSchema)
]);

export const POST = middleware(handleAccept);
