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

const mockService = { hasRole: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  (getApiPermissionService as unknown as vi.Mock).mockReturnValue(mockService);
  mockService.hasRole.mockResolvedValue(true);
});

function makeReq(body: any) {
  return new Request('http://test/api/auth/check-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('POST /api/auth/check-role', () => {
  it('returns role result', async () => {
    const res = await POST(makeReq({ role: 'ADMIN' }) as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.hasRole).toBe(true);
    expect(mockService.hasRole).toHaveBeenCalledWith('u1', 'ADMIN');
  });

  it('validates body', async () => {
    const res = await POST(makeReq({}) as any);
    expect(res.status).toBe(400);
  });
});
