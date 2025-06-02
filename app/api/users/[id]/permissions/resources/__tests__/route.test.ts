import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { withRouteAuth } from '@/middleware/auth';
import { getApiPermissionService } from '@/services/permission/factory';

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'u1' })),
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/services/permission/factory', () => ({ getApiPermissionService: vi.fn() }));

const mockService = { getUserResourcePermissions: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
});

describe('user resource permissions API', () => {
  it('returns filtered permissions', async () => {
    const now = new Date();
    mockService.getUserResourcePermissions.mockResolvedValue([
      { id: '1', userId: 'u1', permission: 'VIEW_PROJECTS', resourceType: 'project', resourceId: 'p1', createdAt: now },
      { id: '2', userId: 'u1', permission: 'VIEW_PROJECTS', resourceType: 'doc', resourceId: 'd1', createdAt: now },
    ]);
    const req = new Request('http://test?resourceType=project');
    const res = await GET(req as any, { params: { id: 'u1' } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.permissions.length).toBe(1);
    expect(mockService.getUserResourcePermissions).toHaveBeenCalledWith('u1');
  });
});
