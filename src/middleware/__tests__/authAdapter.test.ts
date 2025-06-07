import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSession } from '@/middleware/authAdapter';
import { getCurrentSession, getSessionFromRequest } from '@/lib/auth/session';
import { getApiPermissionService } from '@/services/permission/factory';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/session');
vi.mock('@/services/permission/factory');

const mockPermissionService = {
  getUserRoles: vi.fn(),
  getRoleById: vi.fn(),
};

describe('auth-adapter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getApiPermissionService).mockReturnValue(mockPermissionService as any);
  });

  it('returns session with user data', async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: '1',
      email: 't@example.com',
      role: 'user',
      accessToken: 'token',
      expiresAt: Date.now() + 1000,
    } as any);
    mockPermissionService.getUserRoles.mockResolvedValue([{ roleId: 'r1', roleName: 'USER' }]);
    mockPermissionService.getRoleById.mockResolvedValue({ permissions: ['READ'] });

    const session = await getServerSession();
    expect(session).toEqual({
      user: { id: '1', email: 't@example.com', role: 'USER', permissions: ['READ'] },
    });
  });

  it('uses request when provided', async () => {
    const req = new NextRequest('http://localhost');
    vi.mocked(getSessionFromRequest).mockResolvedValue({
      userId: '2',
      email: 'a@b.c',
      role: 'user',
      accessToken: 'tok',
      expiresAt: Date.now() + 1000,
    } as any);
    mockPermissionService.getUserRoles.mockResolvedValue([]);

    const session = await getServerSession(req);
    expect(getSessionFromRequest).toHaveBeenCalledWith(req);
    expect(session).toEqual({
      user: { id: '2', email: 'a@b.c', role: undefined, permissions: [] },
    });
  });

  it('returns null when session expired', async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      userId: '1',
      email: 't@example.com',
      role: 'user',
      accessToken: 'token',
      expiresAt: Date.now() - 1000,
    } as any);

    const session = await getServerSession();
    expect(session).toBeNull();
  });
});
