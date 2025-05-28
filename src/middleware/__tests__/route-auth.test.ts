import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withRouteAuth } from '../auth';
import { validateAuthToken } from '../validate-auth-token';
import { getApiPermissionService } from '@/services/permission/factory';
import { Permission } from '@/lib/rbac/roles';

vi.mock('../validate-auth-token');
vi.mock('@/services/permission/factory');

const mockPermissionService = {
  getUserRoles: vi.fn(),
  getRoleById: vi.fn(),
  hasPermission: vi.fn(),
};

vi.mocked(getApiPermissionService).mockReturnValue(mockPermissionService as any);

const mockUser = { id: 'user-1', role: 'user' } as any;

describe('withRouteAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getApiPermissionService).mockReturnValue(mockPermissionService as any);
  });

  it('returns 401 when token missing', async () => {
    const { createAuthApiError } = await import('../auth-errors');
    vi.mocked(validateAuthToken).mockResolvedValue({ success: false, error: createAuthApiError('MISSING_TOKEN') } as any);
    const req = new NextRequest('http://test');
    const res = await withRouteAuth(() => Promise.resolve(new NextResponse('ok')), req);
    expect(res.status).toBe(401);
  });

  it('passes context on success', async () => {
    vi.mocked(validateAuthToken).mockResolvedValue({ success: true, user: mockUser } as any);
    mockPermissionService.getUserRoles.mockResolvedValue([]);
    mockPermissionService.getRoleById.mockResolvedValue({ permissions: [] });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const req = new NextRequest('http://test', { headers: { authorization: 'Bearer t' } });
    const res = await withRouteAuth(handler, req);
    expect(handler).toHaveBeenCalledWith(req, expect.objectContaining({ userId: 'user-1' }));
    expect(res.status).toBe(200);
  });

  it('checks required permission', async () => {
    vi.mocked(validateAuthToken).mockResolvedValue({ success: true, user: mockUser } as any);
    mockPermissionService.getUserRoles.mockResolvedValue([]);
    mockPermissionService.getRoleById.mockResolvedValue({ permissions: [] });
    mockPermissionService.hasPermission.mockResolvedValue(false);
    const req = new NextRequest('http://test', { headers: { authorization: 'Bearer t' } });
    const res = await withRouteAuth(() => Promise.resolve(new NextResponse('ok')), req, { requiredPermissions: [Permission.VIEW_PROJECTS] });
    expect(res.status).toBe(403);
  });
});
