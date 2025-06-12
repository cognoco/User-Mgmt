import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '@app/api/team/members/[memberId]/route';
import { prisma } from '@/lib/database/prisma';
import { withRouteAuth } from '@/middleware/auth';
import { callRouteWithParams } from 'tests/utils/callRoute';
import { NextResponse } from 'next/server';

// Combined mocks
vi.mock('@/middleware/auth-adapter');
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn(async (handler: any, req: any) => {
    // Attach auth context to request instead of passing as separate argument
    (req as any).auth = {
      userId: 'current-user-id',
      role: 'user',
      user: { id: 'current-user-id', email: 'admin@example.com' },
    };
    return handler(req, {
      userId: 'current-user-id',
      role: 'user',
      user: { id: 'current-user-id', email: 'admin@example.com' },
    });
  }),
}));

describe('DELETE /api/team/members/[memberId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Re-create stubbed methods removed by clearAllMocks
    prisma.teamMember = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    } as any;

    (prisma.teamMember.findFirst as any).mockResolvedValue({ id: 'current', teamId: 'team-123' });
  });

  it('should successfully remove a team member', async () => {


    // Mock team member data
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'user-to-remove',
      role: 'MEMBER',
      teamId: 'team-123',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    // Mock successful deletion
    vi.mocked(prisma.teamMember.delete).mockResolvedValue({} as any);

    const response = await callRouteWithParams(DELETE, { memberId: '11111111-1111-1111-1111-111111111111' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.message).toBe('Team member removed successfully');
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('unauth', { status: 401 }));

    const response = await callRouteWithParams(DELETE, { memberId: '44444444-4444-4444-4444-444444444444' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(401);
  });

  it('should return 403 when user lacks permission', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('forbidden', { status: 403 }));

    const response = await callRouteWithParams(DELETE, { memberId: '55555555-5555-5555-5555-555555555555' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(403);
  });

  it('should return 400 when trying to remove self', async () => {

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'current-user-id',
      role: 'MEMBER',
      teamId: 'team-123',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    const response = await callRouteWithParams(DELETE, { memberId: '11111111-1111-1111-1111-111111111111' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.message).toBe('Cannot remove yourself from the team');
  });

  it('should return 400 when trying to remove last admin', async () => {

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: '22222222-2222-2222-2222-222222222222',
      userId: 'admin-user-id',
      role: 'ADMIN',
      teamId: 'team-123',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' }
        ]
      }
    } as any);

    const response = await callRouteWithParams(DELETE, { memberId: '22222222-2222-2222-2222-222222222222' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.message).toBe('Cannot remove the last admin from the team');
  });

  it('should return 404 when team member is not found', async () => {
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue(null);

    const response = await callRouteWithParams(DELETE, { memberId: '33333333-3333-3333-3333-333333333333' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error.message).toBe('Team member not found');
  });

  it('should return 400 when memberId is invalid', async () => {

    const response = await callRouteWithParams(DELETE, { memberId: 'invalid-uuid' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.message).toBe('Invalid member ID format');
  });

  it('should return 403 when removing member from another team', async () => {
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'user-x',
      role: 'MEMBER',
      teamId: 'team-other',
      team: { members: [] }
    } as any);
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue(null as any);

    const response = await callRouteWithParams(DELETE, { memberId: '11111111-1111-1111-1111-111111111111' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(403);
  });

  it('should return 500 when database operation fails', async () => {

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'user-to-remove',
      role: 'MEMBER',
      teamId: 'team-123',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    vi.mocked(prisma.teamMember.delete).mockRejectedValue(new Error('Database error'));

    const response = await callRouteWithParams(DELETE, { memberId: '11111111-1111-1111-1111-111111111111' }, 'http://localhost', {
      method: 'DELETE'
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.message).toBe('Database error');
  });
});