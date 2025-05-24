import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/database/prisma';
import { GET, POST } from '@/app/api/team/members/route';
import { ERROR_CODES } from '@/lib/api/common';

// Mocks
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findFirst: vi.fn(),
    },
    teamLicense: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rbac/roleService', () => ({
  checkRolePermission: vi.fn().mockResolvedValue(true),
}));

describe('Team Members API', () => {
  const mockSession = {
    user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
  };

  const mockUsers = [
    {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      teamMember: {
        id: 'member1',
        role: 'ADMIN',
        status: 'active',
        joinedAt: '2024-01-01T00:00:00Z',
      },
    },
  ];

  const mockTeam = {
    subscription: {
      seats: 10,
    },
    _count: {
      members: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(prisma.user.count).mockResolvedValue(1);
    vi.mocked(prisma.team.findFirst).mockResolvedValue(mockTeam as any);
    vi.mocked(prisma.teamLicense.findUnique).mockResolvedValue({ usedSeats: 0, totalSeats: 10 });
  });

  it('returns 401 when no session exists', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/team/members');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('returns team members with pagination', async () => {
    const request = new NextRequest('http://localhost:3000/api/team/members');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({
      users: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      seatUsage: {
        used: 5,
        total: 10,
        percentage: 50,
      },
    });
  });

  it('handles search parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/team/members?search=test'
    );
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('handles status filter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/team/members?status=active'
    );
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          teamMember: expect.objectContaining({
            status: 'active',
          }),
        }),
      })
    );
  });

  it('handles sorting', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/team/members?sortBy=name&sortOrder=asc'
    );
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          name: 'asc',
        },
      })
    );
  });

  it('handles pagination parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/team/members?page=2&limit=5'
    );
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      })
    );
  });

  it('validates query parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/team/members?limit=invalid'
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });

  it('handles database errors gracefully', async () => {
    vi.mocked(prisma.user.findMany).mockRejectedValueOnce(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/team/members');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });

  it('returns 400 when seat limit reached', async () => {
    (prisma.teamLicense.findUnique as any).mockResolvedValue({ usedSeats: 5, totalSeats: 5 });
    const request = new Request('http://localhost:3000/api/team/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: 'license-123', userId: 'user2', role: 'member' }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });
});
