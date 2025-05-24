import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createTeamMemberNotFoundError } from '@/lib/api/team/error-handler';

const acceptInviteSchema = z.object({ token: z.string() });

async function handleAccept(req: NextRequest, data: z.infer<typeof acceptInviteSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
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

  if (invite.invitedEmail !== session.user.email) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'This invitation was sent to a different email address', 403);
  }

  try {
    const updated = await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        userId: session.user.id,
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

async function handler(req: NextRequest) {
  const body = await req.json();
  return withValidation(acceptInviteSchema, handleAccept, req, body);
}

export const POST = (req: NextRequest) => withErrorHandling(handler, req);
