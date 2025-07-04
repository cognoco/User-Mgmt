import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';
import { logUserAction } from '@/lib/audit/auditLogger';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withValidation } from '@/middleware/validation';
import { createTeamMemberNotFoundError } from '@/lib/api/team/errorHandler';
import { withSecurity } from '@/middleware/withSecurity';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

const paramSchema = z.object({ memberId: z.string().uuid() });

async function handlePatch(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof updateRoleSchema>,
  memberId: string
) {
  const targetMember = await prisma.teamMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember) {
    throw createTeamMemberNotFoundError();
  }

  const currentUserMember = await prisma.teamMember.findFirst({
    where: { userId: auth.userId!, teamId: targetMember.teamId, role: 'admin' },
  });
  if (!currentUserMember) {
    await logUserAction({
      userId: auth.userId!,
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
      userId: auth.userId!,
      action: 'TEAM_ROLE_UPDATE_SUCCESS',
      status: 'SUCCESS',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { newRole: data.role }
    });
    return createSuccessResponse(updatedMember);
  } catch (error) {
    await logUserAction({
      userId: auth.userId!,
      action: 'TEAM_ROLE_UPDATE_NOT_FOUND',
      status: 'FAILURE',
      targetResourceType: 'team_member',
      targetResourceId: memberId,
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    throw createTeamMemberNotFoundError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const resolvedParams = await params;
  const { memberId } = paramSchema.parse(resolvedParams);
  
  return withSecurity((r) => 
    withErrorHandling((req2) => 
      withRouteAuth(
        (r, auth) =>
          withValidation(updateRoleSchema, (r2, data) => handlePatch(r2, auth, data, memberId), r),
        req2
      ), r
    )
  )(req);
}
