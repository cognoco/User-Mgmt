import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import { checkRolePermission } from '@/lib/rbac/roleService';
import { Role } from '@/types/rbac';
import { withErrorHandling } from '@/middleware/error-handling';

async function handleGet() {
  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permission
    const hasAdminAccess = await checkRolePermission(
      user.app_metadata?.role as Role,
      'ACCESS_ADMIN_DASHBOARD'
    );
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get team statistics
    const teamStats = await prisma.teamMember.groupBy({
      by: ['status'],
      _count: {
        _all: true
      },
      where: {
        teamId: user.app_metadata?.teamId
      }
    });

    // Get subscription info
    const subscription = await prisma.subscription.findUnique({
      where: {
        teamId: user.app_metadata?.teamId
      },
      select: {
        plan: true,
        status: true,
        seats: true,
        trialEndsAt: true,
        currentPeriodEndsAt: true
      }
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.activityLog.findMany({
      where: {
        teamId: user.app_metadata?.teamId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate team member status counts
    const activeMembers = teamStats.find((stat: any) => stat.status === 'ACTIVE')?._count._all ?? 0;
    const pendingMembers = teamStats.find((stat: any) => stat.status === 'PENDING')?._count._all ?? 0;
    const totalMembers = activeMembers + pendingMembers;

    // Calculate seat usage
    const seatLimit = subscription?.seats ?? 0;
    const seatUsagePercentage = seatLimit > 0 ? (totalMembers / seatLimit) * 100 : 0;

    // Prepare response data
    const dashboardData = {
      team: {
        activeMembers,
        pendingMembers,
        totalMembers,
        seatUsage: {
          used: totalMembers,
          total: seatLimit,
          percentage: Math.round(seatUsagePercentage)
        }
      },
      subscription: {
        plan: subscription?.plan ?? 'NO_PLAN',
        status: subscription?.status ?? 'INACTIVE',
        trialEndsAt: subscription?.trialEndsAt,
        currentPeriodEndsAt: subscription?.currentPeriodEndsAt
      },
      recentActivity
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
export const GET = (req: NextRequest) => withErrorHandling(() => handleGet(), req);
