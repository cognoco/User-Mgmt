import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '../route';

const mockService = {
  getRolePermissions: vi.fn(),
  addPermissionToRole: vi.fn(),
  removePermissionFromRole: vi.fn(),
};
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => mockService,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('role permissions API', () => {
  it('GET returns permissions', async () => {
    mockService.getRolePermissions.mockResolvedValue(['p1']);
    const res = await GET(new Request('http://test') as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
    expect(mockService.getRolePermissions).toHaveBeenCalledWith('1');
  });

  it('POST assigns permission', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ permission: 'p1' }) });
    (req as any).json = async () => ({ permission: 'p1' });
    mockService.addPermissionToRole.mockResolvedValue({ id: '123' });
    const res = await POST(req as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(200);
    expect(mockService.addPermissionToRole).toHaveBeenCalled();
  });

  it('DELETE removes permission', async () => {
    const req = new Request('http://test', { method: 'DELETE', body: JSON.stringify({ permission: 'p1' }) });
    (req as any).json = async () => ({ permission: 'p1' });
    mockService.removePermissionFromRole.mockResolvedValue(true);
    const res = await DELETE(req as any, { params: { roleId: '1' } } as any);
    expect(res.status).toBe(204);
    expect(mockService.removePermissionFromRole).toHaveBeenCalledWith('1', 'p1');
  });
});
