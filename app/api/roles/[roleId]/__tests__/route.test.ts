import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, PUT, DELETE } from '../route';
import { withRouteAuth } from '@/middleware/auth';

vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'u1' })),
}));

const mockService = {
  getRoleById: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
};
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => mockService,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('roles id API', () => {
  it('GET returns role', async () => {
    mockService.getRoleById.mockResolvedValue({ id: '1' });
    const res = await GET({} as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
  });

  it('PATCH updates role', async () => {
    const req = new Request('http://test', { method: 'PATCH', body: JSON.stringify({ name: 'n' }) });
    (req as any).json = async () => ({ name: 'n' });
    mockService.updateRole.mockResolvedValue({ id: '1' });
    const res = await PATCH(req as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
    expect(mockService.updateRole).toHaveBeenCalledWith('1', { name: 'n' }, 'u1');
  });

  it('PUT updates role', async () => {
    const req = new Request('http://test', { method: 'PUT', body: JSON.stringify({ name: 'n' }) });
    (req as any).json = async () => ({ name: 'n' });
    mockService.updateRole.mockResolvedValue({ id: '1' });
    const res = await PUT(req as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
    expect(mockService.updateRole).toHaveBeenCalledWith('1', { name: 'n' }, 'u1');
  });

  it('DELETE removes role', async () => {
    mockService.deleteRole.mockResolvedValue(true);
    const res = await DELETE({} as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(204);
    expect(mockService.deleteRole).toHaveBeenCalledWith('1', 'u1');
  });
});
