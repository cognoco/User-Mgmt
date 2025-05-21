import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { prisma } from '@/lib/database/prisma';
import { checkRolePermission } from '@/lib/rbac/roleService';
import { Permission, isPermission } from '@/lib/rbac/roles';

const querySchema = z.object({
  permission: z.string(),
  resourceId: z.string().optional(),
  resourceType: z.enum(['team', 'project', 'organization']).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ hasPermission: false });
    }

    // Get user from database to ensure we have the ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ hasPermission: false });
    }

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { permission, resourceId, resourceType } = querySchema.parse(queryParams);

    // Validate permission
    if (!isPermission(permission)) {
      return NextResponse.json({ hasPermission: false });
    }

    // Get user's team role
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: user.id },
      select: { role: true, teamId: true },
    });

    if (!teamMember) {
      return NextResponse.json({ hasPermission: false });
    }

    // Check resource access if specified
    if (resourceId && resourceType) {
      let hasResourceAccess = false;

      switch (resourceType) {
        case 'team':
          hasResourceAccess = resourceId === teamMember.teamId;
          break;

        case 'project': {
          const project = await prisma.project.findUnique({
            where: { id: resourceId },
            select: { teamId: true },
          });
          hasResourceAccess = project?.teamId === teamMember.teamId;
          break;
        }

        case 'organization': {
          const organization = await prisma.organization.findUnique({
            where: { id: resourceId },
            select: { teams: { select: { id: true } } },
          });
          hasResourceAccess = organization?.teams.some((team: { id: string }) => team.id === teamMember.teamId) ?? false;
          break;
        }
      }

      if (!hasResourceAccess) {
        return NextResponse.json({ hasPermission: false });
      }
    }

    // Check role permission
    const hasPermission = await checkRolePermission(
      teamMember.role,
      permission as Permission
    );

    return NextResponse.json({ hasPermission });
  } catch (error) {
    console.error('Permission check failed:', error);
    return NextResponse.json({ hasPermission: false });
  }
}