import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '../route';
import { getSupabaseServerClient } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import { hasPermission } from '@/lib/auth/hasPermission';

vi.mock('@/lib/auth');
vi.mock('@/lib/database/prisma');
vi.mock('@/lib/auth/hasPermission');

describe('DELETE /api/team/members/[memberId]', () => {
  const mockSupabase = { auth: { getUser: vi.fn() } } as any;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase);
  });

  it('should successfully remove a team member', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    // Mock permission check
    vi.mocked(hasPermission).mockResolvedValue(true);

    // Mock team member data
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: 'member-1',
      userId: 'user-to-remove',
      role: 'MEMBER',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    // Mock successful deletion
    vi.mocked(prisma.teamMember.delete).mockResolvedValue({} as any);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'member-1' } }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Team member removed successfully');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'auth', status: 401 } });

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'member-1' } }
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user lacks permission', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'user@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(false);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'member-1' } }
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 when trying to remove self', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(true);

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: 'member-1',
      userId: 'current-user-id',
      role: 'MEMBER',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'member-1' } }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Cannot remove yourself from the team');
  });

  it('should return 400 when trying to remove last admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(true);

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: 'admin-1',
      userId: 'admin-user-id',
      role: 'ADMIN',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' }
        ]
      }
    } as any);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'admin-1' } }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Cannot remove the last admin from the team');
  });

  it('should return 404 when team member is not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue(null);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'non-existent' } }
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Team member not found');
  });

  it('should return 400 when memberId is invalid', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(true);

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'invalid-uuid' } }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid member ID format');
  });

  it('should return 500 when database operation fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'current-user-id', email: 'admin@example.com' } }, error: null });

    vi.mocked(hasPermission).mockResolvedValue(true);

    vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({
      id: 'member-1',
      userId: 'user-to-remove',
      role: 'MEMBER',
      team: {
        members: [
          { id: 'admin-1', role: 'ADMIN' },
          { id: 'member-1', role: 'MEMBER' }
        ]
      }
    } as any);

    vi.mocked(prisma.teamMember.delete).mockRejectedValue(new Error('Database error'));

    const response = await DELETE(
      new Request('http://localhost'),
      { params: { memberId: 'member-1' } }
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to remove team member');
  });
});