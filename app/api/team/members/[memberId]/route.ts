import { type NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import { hasPermission } from '@/lib/auth/hasPermission';
import { z } from 'zod';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createTeamMemberNotFoundError } from '@/lib/api/team/error-handler';
import { withSecurity } from '@/middleware/with-security';

const paramSchema = z.object({ memberId: z.string().uuid() });

async function handleDelete(
  req: NextRequest,
  params: z.infer<typeof paramSchema>
) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', 401);
  }

  if (!(await hasPermission(user.id, 'REMOVE_TEAM_MEMBER'))) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'Forbidden', 403);
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

  if (teamMember.userId === user.id) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Cannot remove yourself from the team', 400);
  }

  if (teamMember.role === 'ADMIN' && teamMember.team.members.length === 1) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Cannot remove the last admin from the team', 400);
  }

  await prisma.teamMember.delete({ where: { id: params.memberId } });

  return createSuccessResponse({ message: 'Team member removed successfully' });
}

async function handler(req: NextRequest, context: { params: { memberId: string } }) {
  return withValidation(paramSchema, handleDelete, req, context.params);
}

export const DELETE = (
  req: NextRequest,
  ctx: { params: { memberId: string } }
) => withSecurity((r) => withErrorHandling((req2) => handler(req2, ctx), r))(req);
