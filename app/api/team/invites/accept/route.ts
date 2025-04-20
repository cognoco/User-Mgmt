import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';

const acceptInviteSchema = z.object({
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { token } = acceptInviteSchema.parse(body);

    // Find the invite
    const invite = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: {
        teamLicense: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invite is expired
    if (invite.inviteExpires && invite.inviteExpires < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if the invite was sent to the current user's email
    if (invite.invitedEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Accept the invite
    const updatedMember = await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        userId: session.user.id,
        status: 'active',
        inviteToken: null,
        inviteExpires: null,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Failed to accept team invite:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to accept team invite' },
      { status: 500 }
    );
  }
} 