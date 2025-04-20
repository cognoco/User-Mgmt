import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from '@/types/next-auth';

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

      return NextResponse.json(updatedMember);
    } catch (error) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to update team member role:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team member role' },
      { status: 500 }
    );
  }
} 