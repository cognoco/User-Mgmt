import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { ERROR_CODES } from '@/lib/api/common';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    teamMember: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('POST /api/team/invites/accept', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockInvite = {
    id: 'invite-123',
    invitedEmail: 'test@example.com',
    inviteToken: 'valid-token',
    inviteExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    teamLicense: {
      id: 'license-123',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (prisma.teamMember.findUnique as any).mockResolvedValue(mockInvite);
    (prisma.teamMember.update as any).mockResolvedValue({
      ...mockInvite,
      userId: mockSession.user.id,
      status: 'active',
      inviteToken: null,
      inviteExpires: null,
    });
  });

  it('accepts a valid invite', async () => {
    const request = new Request('http://localhost:3000/api/team/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ...mockInvite,
      userId: mockSession.user.id,
      status: 'active',
      inviteToken: null,
      inviteExpires: null,
    });
    expect(prisma.teamMember.update).toHaveBeenCalledWith({
      where: { id: mockInvite.id },
      data: {
        userId: mockSession.user.id,
        status: 'active',
        inviteToken: null,
        inviteExpires: null,
      },
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/team/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('returns 400 when invite token is invalid', async () => {
    (prisma.teamMember.findUnique as any).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/team/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid-token',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });

  it('returns 400 when invite is expired', async () => {
    (prisma.teamMember.findUnique as any).mockResolvedValue({
      ...mockInvite,
      inviteExpires: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    });

    const request = new Request('http://localhost:3000/api/team/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });

  it('returns 403 when invite email does not match user email', async () => {
    (prisma.teamMember.findUnique as any).mockResolvedValue({
      ...mockInvite,
      invitedEmail: 'different@example.com',
    });

    const request = new Request('http://localhost:3000/api/team/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-token',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('should return 400 when request body is invalid', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com'
      }
    } as any);

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        // Missing token field
      })
    }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
    expect(data.error.details).toBeDefined();
  });

  it('should return 500 when database operation fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com'
      }
    } as any);

    vi.mocked(prisma.teamMember.findUnique).mockRejectedValue(new Error('Database error'));

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token'
      })
    }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
}); 
