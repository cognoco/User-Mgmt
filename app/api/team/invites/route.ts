import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { generateInviteToken } from '@/lib/utils/token';
import { sendTeamInviteEmail } from '@/lib/email/teamInvite';
import { createProtectedHandler } from '@/middleware/permissions';
import { Permission } from '@/lib/rbac/roles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { checkRolePermission } from '@/lib/rbac/roleService';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  teamLicenseId: z.string(),
});

type InviteRequest = z.infer<typeof inviteSchema>;

// Define the main handler logic
async function handler(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get invoking user details (including role and teamId for permission check)
    const invokingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, teamMemberships: { select: { teamId: true, role: true } } },
    });

    if (!invokingUser || !invokingUser.teamMemberships || invokingUser.teamMemberships.length === 0) {
      return NextResponse.json({ error: 'Invoking user not found or not part of any team' }, { status: 403 });
    }
    // Assuming user belongs to one team for this context
    const invokingUserRole = invokingUser.teamMemberships[0].role;
    const invokingUserTeamId = invokingUser.teamMemberships[0].teamId;

    const body = await req.json();
    const validatedData = inviteSchema.parse(body);

    // **** Resource-specific Permission Check ****
    // Check if the invoking user belongs to the team associated with the target teamLicenseId
    const targetLicense = await prisma.teamLicense.findUnique({
      where: { id: validatedData.teamLicenseId },
      select: { teamId: true }
    });

    if (!targetLicense) {
      return NextResponse.json({ error: 'Target team license not found' }, { status: 404 });
    }

    // Perform the actual check: is the user in the target team?
    // (Or more advanced: does the user's role grant permission *for this specific team*?)
    // For now, let's assume being in the same team is sufficient if they have the INVITE permission.
    if (targetLicense.teamId !== invokingUserTeamId) {
      console.warn(`User ${invokingUser.id} tried to invite to license ${validatedData.teamLicenseId} (team ${targetLicense.teamId}) but belongs to team ${invokingUserTeamId}`);
      return NextResponse.json({ error: 'Forbidden: Cannot invite members to this team license.' }, { status: 403 });
    }
    // **** End Resource Check ****

    // Check seat limit
    const teamLicense = await prisma.teamLicense.findUnique({
      where: { id: validatedData.teamLicenseId },
      select: {
        usedSeats: true,
        totalSeats: true,
      },
    });

    if (!teamLicense) {
      return NextResponse.json(
        { error: 'Team license not found' },
        { status: 404 }
      );
    }

    if (teamLicense.usedSeats >= teamLicense.totalSeats) {
      return NextResponse.json(
        { error: 'Team has reached its seat limit' },
        { status: 400 }
      );
    }

    // Check if user is already a member or invited
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        OR: [
          { userId: invokingUser.id, teamLicenseId: validatedData.teamLicenseId },
          { invitedEmail: validatedData.email, teamLicenseId: validatedData.teamLicenseId },
        ],
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member or has a pending invitation' },
        { status: 400 }
      );
    }

    // Create invite
    const inviteToken = generateInviteToken();
    const invite = await prisma.teamMember.create({
      data: {
        teamLicenseId: validatedData.teamLicenseId,
        role: validatedData.role,
        invitedEmail: validatedData.email,
        invitedBy: invokingUser.id,
        inviteToken,
        inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
      },
    });

    // Increment used seats
    await prisma.teamLicense.update({
      where: { id: validatedData.teamLicenseId },
      data: { usedSeats: { increment: 1 } },
    });

    // Send invite email
    await sendTeamInviteEmail({
      to: validatedData.email,
      inviteToken,
      invitedByEmail: session.user.email,
      teamName: 'Your Team', // TODO: Add team name to TeamLicense model
      role: validatedData.role,
    });

    return NextResponse.json({ message: "Invite sent successfully" });
  } catch (error) {
    console.error('Failed to create team invite:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create team invite' },
      { status: 500 }
    );
  }
}

// Export the protected handler, now only checking the general permission
export const POST = createProtectedHandler(
  handler, 
  Permission.INVITE_TEAM_MEMBER // General permission check
); 