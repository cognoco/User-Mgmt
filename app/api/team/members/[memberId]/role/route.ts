import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { getSupabaseServerClient } from '@/lib/auth';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createTeamMemberNotFoundError } from '@/lib/api/team/error-handler';
import { withSecurity } from '@/middleware/with-security';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

async function handlePatch(
  req: NextRequest,
  data: z.infer<typeof updateRoleSchema>,
  memberId: string
) {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    await logUserAction({
      action: 'TEAM_ROLE_UPDATE_ATTEMPT',
      status: 'FAILURE',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { reason: 'Unauthorized' }
    });
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized', 401);
  }

  const currentUserMember = await prisma.teamMember.findFirst({
    where: { userId: user.id, role: 'admin' },
  });
  if (!currentUserMember) {
    await logUserAction({
      userId: user.id,
      action: 'TEAM_ROLE_UPDATE_ATTEMPT',
      status: 'FAILURE',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { reason: 'Only admins can update member roles' }
    });
    throw new ApiError(ERROR_CODES.FORBIDDEN, 'Only admins can update member roles', 403);
  }

  try {
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role: data.role },
    });
    await logUserAction({
      userId: user.id,
      action: 'TEAM_ROLE_UPDATE_SUCCESS',
      status: 'SUCCESS',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { newRole: data.role }
    });
    return createSuccessResponse(updatedMember);
  } catch (error) {
    await logUserAction({
      userId: user.id,
      action: 'TEAM_ROLE_UPDATE_NOT_FOUND',
      status: 'FAILURE',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    throw createTeamMemberNotFoundError();
  }
}

async function handler(
  req: NextRequest,
  context: { params: { memberId: string } }
) {
  return withValidation(updateRoleSchema, (r, data) => handlePatch(r, data, context.params.memberId), req);
}

export const PATCH = (
  req: NextRequest,
  ctx: { params: { memberId: string } }
) => withSecurity((r) => withErrorHandling((req2) => handler(req2, ctx), r))(req);
