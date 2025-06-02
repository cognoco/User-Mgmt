import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiPermissionService } from '@/services/permission/factory';

vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/services/permission/factory', () => ({ getApiPermissionService: vi.fn() }));
vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    routeAuthMiddleware: vi.fn(() => (handler: any) => (req: any, _ctx?: any, data?: any) => handler(req, { userId: 'u1' }, data)),
  };
});

const mockService = { hasPermission: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
  mockService.hasPermission.mockResolvedValue(true);
});

function createReq(body: any) {
  return new Request('http://test/api/auth/check-permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('POST /api/auth/check-permissions', () => {
  it('returns results for checks', async () => {
    const res = await POST(createReq({ checks: [{ permission: 'VIEW_PROJECTS' }] }) as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.results[0].hasPermission).toBe(true);
    expect(mockService.hasPermission).toHaveBeenCalledWith('u1', 'VIEW_PROJECTS');
  });

  it('validates body', async () => {
    const res = await POST(createReq({}) as any);
    expect(res.status).toBe(400);
  });
});
