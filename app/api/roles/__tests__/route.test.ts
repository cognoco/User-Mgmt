import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/roles/route';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';
import type { PermissionService } from '@/core/permission/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

const mockService: Partial<PermissionService> = {
  getAllRoles: vi.fn(),
  createRole: vi.fn(),
};
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
});

describe('roles root API', () => {
  it('GET returns roles', async () => {
    mockService.getAllRoles.mockResolvedValue([{ id: '1' }]);
    const res = await GET(createAuthenticatedRequest('GET', 'http://test'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.roles).toEqual([{ id: '1' }]);
  });

  it('GET supports pagination', async () => {
    mockService.getAllRoles.mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const res = await GET(createAuthenticatedRequest('GET', 'http://test?page=2&limit=1'));
    const body = await res.json();
    expect(body.data.page).toBe(2);
    expect(body.data.roles).toEqual([{ id: '2' }]);
  });

  it('POST creates role', async () => {
    const req = createAuthenticatedRequest('POST', 'http://test', { name: 'r', permissions: [] });
    mockService.createRole.mockResolvedValue({ id: '1' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(mockService.createRole).toHaveBeenCalledWith({ name: 'r', permissions: [] }, 'u1');
  });
});
