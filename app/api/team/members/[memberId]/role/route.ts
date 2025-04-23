import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from '@/types/next-auth';
import { logUserAction } from '@/lib/audit/auditLogger';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

export async function PATCH(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      await logUserAction({
        action: 'TEAM_ROLE_UPDATE_ATTEMPT',
        status: 'FAILURE',
        ipAddress: undefined,
        userAgent: undefined,
        userId: undefined,
        targetResourceType: 'team_member',
        targetResourceId: params.memberId,
        details: { reason: 'Unauthorized' }
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { memberId } = params;

    // Check if the current user is an admin of the team
    const currentUserMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: 'admin',
      },
    });

    if (!currentUserMember) {
      await logUserAction({
        userId: session.user.id,
        action: 'TEAM_ROLE_UPDATE_ATTEMPT',
        status: 'FAILURE',
        ipAddress: undefined,
        userAgent: undefined,
        targetResourceType: 'team_member',
        targetResourceId: params.memberId,
        details: { reason: 'Only admins can update member roles' }
      });
      return NextResponse.json(
        { error: 'Only admins can update member roles' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    // Update the member's role
    try {
      const updatedMember = await prisma.teamMember.update({
        where: { id: memberId },
        data: { role },
      });

      await logUserAction({
        userId: session.user.id,
        action: 'TEAM_ROLE_UPDATE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: undefined,
        userAgent: undefined,
        targetResourceType: 'team_member',
        targetResourceId: memberId,
        details: { newRole: role }
      });
      return NextResponse.json(updatedMember);
    } catch (error) {
      await logUserAction({
        userId: session.user.id,
        action: 'TEAM_ROLE_UPDATE_NOT_FOUND',
        status: 'FAILURE',
        ipAddress: undefined,
        userAgent: undefined,
        targetResourceType: 'team_member',
        targetResourceId: memberId,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to update team member role:', error);
    
    if (error instanceof z.ZodError) {
      await logUserAction({
        userId: session?.user?.id,
        action: 'TEAM_ROLE_UPDATE_VALIDATION_ERROR',
        status: 'FAILURE',
        ipAddress: undefined,
        userAgent: undefined,
        targetResourceType: 'team_member',
        targetResourceId: params.memberId,
        details: { error: error.errors }
      });
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    await logUserAction({
      userId: session?.user?.id,
      action: 'TEAM_ROLE_UPDATE_ERROR',
      status: 'FAILURE',
      ipAddress: undefined,
      userAgent: undefined,
      targetResourceType: 'team_member',
      targetResourceId: params.memberId,
      details: { error: error instanceof Error ? error.message : String(error) }
    });
    return NextResponse.json(
      { error: 'Failed to update team member role' },
      { status: 500 }
    );
  }
} 