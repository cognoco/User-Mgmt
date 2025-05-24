import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';

const mockService = {
  getAllRoles: vi.fn(),
  createRole: vi.fn(),
};
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => mockService,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('roles root API', () => {
  it('GET returns roles', async () => {
    mockService.getAllRoles.mockResolvedValue([{ id: '1' }]);
    const res = await GET({} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.roles).toEqual([{ id: '1' }]);
  });

  it('POST creates role', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'r', permissions: [] }) });
    (req as any).json = async () => ({ name: 'r', permissions: [] });
    mockService.createRole.mockResolvedValue({ id: '1' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(mockService.createRole).toHaveBeenCalled();
  });
});
