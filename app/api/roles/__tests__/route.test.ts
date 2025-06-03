import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { withRouteAuth } from '@/middleware/auth';

vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'u1' })),
}));

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
    const res = await GET(new Request('http://test'), {} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.roles).toEqual([{ id: '1' }]);
  });

  it('GET supports pagination', async () => {
    mockService.getAllRoles.mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const res = await GET(new Request('http://test?page=2&limit=1'), {} as any);
    const body = await res.json();
    expect(body.data.page).toBe(2);
    expect(body.data.roles).toEqual([{ id: '2' }]);
  });

  it('POST creates role', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'r', permissions: [] }) });
    (req as any).json = async () => ({ name: 'r', permissions: [] });
    mockService.createRole.mockResolvedValue({ id: '1' });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(mockService.createRole).toHaveBeenCalledWith({ name: 'r', permissions: [] }, 'u1');
  });
});
