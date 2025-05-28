import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { getServerSession } from '@/middleware/auth-adapter';
import { prisma } from '@/lib/database/prisma';
import { checkRolePermission } from '@/lib/rbac/roleService';

// Mock dependencies
vi.mock('@/middleware/auth-adapter', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    teamMember: {
      groupBy: vi.fn()
    },
    subscription: {
      findUnique: vi.fn()
    },
    activityLog: {
      findMany: vi.fn()
    }
  }
}));

vi.mock('@/lib/rbac/roleService', () => ({
  checkRolePermission: vi.fn()
}));

describe('Admin Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 when user lacks admin permission', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', teamId: '1', role: 'USER' }
    } as any);
    vi.mocked(checkRolePermission).mockResolvedValueOnce(false);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('returns dashboard data for authorized admin', async () => {
    // Mock session
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', teamId: '1', role: 'ADMIN' }
    } as any);
    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);

    // Mock team stats
    vi.mocked(prisma.teamMember.groupBy).mockResolvedValueOnce([
      { status: 'ACTIVE', _count: { _all: 5 } },
      { status: 'PENDING', _count: { _all: 2 } }
    ] as any);

    // Mock subscription data
    vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce({
      plan: 'PRO',
      status: 'ACTIVE',
      seats: 10,
      trialEndsAt: null,
      currentPeriodEndsAt: new Date('2025-01-01')
    } as any);

    // Mock activity logs
    const mockActivity = {
      id: '1',
      type: 'MEMBER_ADDED',
      description: 'New member added',
      createdAt: new Date(),
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }
    };
    vi.mocked(prisma.activityLog.findMany).mockResolvedValueOnce([mockActivity] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      team: {
        activeMembers: 5,
        pendingMembers: 2,
        totalMembers: 7,
        seatUsage: {
          used: 7,
          total: 10,
          percentage: 70
        }
      },
      subscription: {
        plan: 'PRO',
        status: 'ACTIVE',
        trialEndsAt: null,
        currentPeriodEndsAt: expect.any(String)
      },
      recentActivity: [mockActivity]
    });
  });

  it('handles database errors gracefully', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', teamId: '1', role: 'ADMIN' }
    } as any);
    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);
    vi.mocked(prisma.teamMember.groupBy).mockRejectedValueOnce(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch dashboard data' });
  });

  it('handles missing subscription data', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: '1', teamId: '1', role: 'ADMIN' }
    } as any);
    vi.mocked(checkRolePermission).mockResolvedValueOnce(true);
    vi.mocked(prisma.teamMember.groupBy).mockResolvedValueOnce([]);
    vi.mocked(prisma.subscription.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.activityLog.findMany).mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subscription).toEqual({
      plan: 'NO_PLAN',
      status: 'INACTIVE',
      trialEndsAt: null,
      currentPeriodEndsAt: null
    });
  });
});