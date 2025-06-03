import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { withRouteAuth } from '@/middleware/auth';
import { getApiPermissionService } from '@/services/permission/factory';
import { checkPermission } from '@/lib/auth/permissionCheck';

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'u1' })),
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/services/permission/factory', () => ({ getApiPermissionService: vi.fn() }));
vi.mock('@/lib/auth/permissionCheck', () => ({ checkPermission: vi.fn() }));

const mockService = { getPermissionsForResource: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
  (checkPermission as unknown as vi.Mock).mockResolvedValue(true);
});

describe('resource permissions list API', () => {
  it('returns paginated permissions', async () => {
    mockService.getPermissionsForResource.mockResolvedValue([
      { id: '1', userId: 'u1', permission: 'VIEW_PROJECTS', resourceType: 'project', resourceId: 'p1', createdAt: new Date() },
      { id: '2', userId: 'u2', permission: 'VIEW_PROJECTS', resourceType: 'project', resourceId: 'p1', createdAt: new Date() },
    ]);
    const req = new Request('http://test');
    const res = await GET(req as any, { params: { type: 'project', id: 'p1' } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBe(2);
    expect(mockService.getPermissionsForResource).toHaveBeenCalledWith('project', 'p1');
  });
});
