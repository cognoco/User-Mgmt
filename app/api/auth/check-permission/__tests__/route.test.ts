import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiPermissionService } from '@/services/permission/factory';

vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/services/permission/factory', () => ({ getApiPermissionService: vi.fn() }));
vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    routeAuthMiddleware: vi.fn(() => (handler: any) => (req: any, _ctx?: any, data?: any) => handler(req, { userId: 'user-1' }, data)),
  };
});

const mockService = { hasPermission: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
  mockService.hasPermission.mockResolvedValue(true);
});

function createRequest(body: any) {
  return new Request('http://localhost/api/auth/check-permission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
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
