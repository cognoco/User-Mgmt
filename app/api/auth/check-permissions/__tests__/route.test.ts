import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@app/api/auth/check-permissions/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

vi.mock('@/services/permission/factory', () => ({}));
vi.mock('@/services/auth/factory', () => ({}));

const mockService: Partial<PermissionService> = { hasPermission: vi.fn() };
const mockAuth: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  resetServiceContainer();
  configureServices({
    permissionService: mockService as PermissionService,
    authService: mockAuth as AuthService,
  });
  vi.mocked(mockService.hasPermission).mockResolvedValue(true);
});

function createReq(body: any) {
  return createAuthenticatedRequest(
    'POST',
    'http://test/api/auth/check-permissions',
    body,
  );
}

describe('POST /api/auth/check-permissions', () => {
  it('returns results for checks', async () => {
    const res = await POST(createReq({ checks: [{ permission: 'VIEW_PROJECTS' }] }) as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.results[0].hasPermission).toBe(true);
    expect(mockService.hasPermission).toHaveBeenCalledWith('u1', 'VIEW_PROJECTS');
  });

  it('validates body', async () => {
    const res = await POST(createReq({}) as any);
    expect(res.status).toBe(400);
  });
});
