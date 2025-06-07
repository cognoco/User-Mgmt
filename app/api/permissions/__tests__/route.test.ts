import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/permissions/route'64;
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer'103;
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers'327;

const mockPermissionService: Partial<PermissionService> = { getAllPermissions: vi.fn() };
const mockAuth: Partial<AuthService> = { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) };

beforeEach(() => {
  vi.resetAllMocks();
  resetServiceContainer();
  configureServices({ permissionService: mockPermissionService as PermissionService, authService: mockAuth as AuthService });
});

describe('permissions root API', () => {
  it('GET returns permissions', async () => {
    mockPermissionService.getAllPermissions!.mockResolvedValue(['READ']);
    const res = await GET(createAuthenticatedRequest('GET', 'http://test'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.permissions).toEqual(['READ']);
  });

  it('POST is not allowed', async () => {
    const res = await POST(createAuthenticatedRequest('POST', 'http://test'));
    expect(res.status).toBe(405);
  });
});
