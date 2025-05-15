import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';
import { hasPermission } from '@/lib/auth/hasPermission';

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to remove team members
    if (!await hasPermission(session.user.id, 'REMOVE_TEAM_MEMBER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate memberId parameter
    const memberIdSchema = z.string().uuid();
    const validationResult = memberIdSchema.safeParse(params.memberId);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid member ID format' }, { status: 400 });
    }

    // Get the team member to be removed
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: params.memberId },
      include: {
        team: {
          include: {
            members: {
              where: {
                role: 'ADMIN'
              }
            }
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check if trying to remove self
    if (teamMember.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 });
    }

    // Check if removing the last admin
    if (teamMember.role === 'ADMIN' && teamMember.team.members.length === 1) {
      return NextResponse.json({ error: 'Cannot remove the last admin from the team' }, { status: 400 });
    }

    // Remove the team member
    await prisma.teamMember.delete({
      where: { id: params.memberId }
    });

    return NextResponse.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}