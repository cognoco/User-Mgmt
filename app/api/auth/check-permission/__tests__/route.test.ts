import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/check-permission/route'64;
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer'98;
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'322;

vi.mock('@/services/permission/factory', () => ({}));
vi.mock('@/services/auth/factory', () => ({}));

const mockService: Partial<PermissionService> = {
  hasPermission: vi.fn(),
};
const mockAuth: Partial<AuthService> = {
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
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

function createRequest(body: any) {
  return createAuthenticatedRequest(
    'POST',
    'http://localhost/api/auth/check-permission',
    body,
  );
}

describe('POST /api/auth/check-permission', () => {
  it('returns permission result', async () => {
    const res = await POST(
      createRequest({ permission: 'ADMIN_ACCESS' }) as any
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.hasPermission).toBe(true);
    expect(mockService.hasPermission).toHaveBeenCalledWith('user-1', 'ADMIN_ACCESS');
  });

  it('caches permission checks', async () => {
    await POST(createRequest({ permission: 'ADMIN_ACCESS' }) as any);
    await POST(createRequest({ permission: 'ADMIN_ACCESS' }) as any);
    expect(mockService.hasPermission).toHaveBeenCalledTimes(1);
  });

  it('validates request body', async () => {
    const res = await POST(createRequest({}) as any);
    expect(res.status).toBe(400);
  });
});
