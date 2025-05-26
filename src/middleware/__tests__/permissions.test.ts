import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withPermissionCheck } from '../permissions';
import { Permission } from '@/lib/rbac/roles';
import { getApiAuthService } from '@/services/auth/factory';
import { getApiPermissionService } from '@/services/permission/factory';

vi.mock('@/services/auth/factory');
vi.mock('@/services/permission/factory');

const mockAuthService = {
  getSession: vi.fn(),
};
const mockPermissionService = {
  hasPermission: vi.fn(),
  getUserRoles: vi.fn(),
};

vi.mocked(getApiAuthService).mockReturnValue(mockAuthService as any);
vi.mocked(getApiPermissionService).mockReturnValue(mockPermissionService as any);

const mockHandler = vi.fn().mockResolvedValue(new NextResponse('ok'));
const mockRequest = new NextRequest(new URL('http://localhost'));

describe('withPermissionCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getApiAuthService).mockReturnValue(mockAuthService as any);
    vi.mocked(getApiPermissionService).mockReturnValue(mockPermissionService as any);
    mockPermissionService.getUserRoles.mockResolvedValue([{ roleName: 'ADMIN' }]);
    (globalThis as any)['__UM_PERMISSION_CACHE__']?.clear?.();
  });

  it('returns 401 when session is missing', async () => {
    mockAuthService.getSession.mockResolvedValue(null);
    const middleware = withPermissionCheck(mockHandler, {
      requiredPermission: Permission.VIEW_TEAM_MEMBERS,
    });
    const res = await middleware(mockRequest);
    expect(res.status).toBe(401);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('denies access when permission service returns false', async () => {
    mockAuthService.getSession.mockResolvedValue({ user: { id: '1' } });
    mockPermissionService.hasPermission.mockResolvedValue(false);
    const middleware = withPermissionCheck(mockHandler, {
      requiredPermission: Permission.MANAGE_BILLING,
    });
    const res = await middleware(mockRequest);
    expect(res.status).toBe(403);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('allows access when permission service returns true', async () => {
    mockAuthService.getSession.mockResolvedValue({ user: { id: '1' } });
    mockPermissionService.hasPermission.mockResolvedValue(true);
    const middleware = withPermissionCheck(mockHandler, {
      requiredPermission: Permission.VIEW_TEAM_MEMBERS,
    });
    await middleware(mockRequest);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('caches permission checks', async () => {
    mockAuthService.getSession.mockResolvedValue({ user: { id: '1' } });
    mockPermissionService.hasPermission.mockResolvedValue(true);
    const middleware = withPermissionCheck(mockHandler, {
      requiredPermission: Permission.VIEW_TEAM_MEMBERS,
    });
    await middleware(mockRequest);
    await middleware(mockRequest);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(1);
  });
});
