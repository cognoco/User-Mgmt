import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { withRouteAuth } from '@/middleware/auth';

const mockPermissionService = {
  hasPermission: vi.fn(),
};
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => mockPermissionService,
}));

vi.mock('@/lib/api/permission/error-handler', async () => {
  return await vi.importActual('@/lib/api/permission/error-handler');
});

beforeEach(() => {
  vi.resetAllMocks();
  (withRouteAuth as any).mockImplementation((handler: any, req: any) =>
    handler(req, {
      userId: 'user-1',
      user: { id: 'user-1', app_metadata: { permissions: ['VIEW_PROJECTS'] } },
    })
  );
});

describe('GET /api/permissions/check', () => {
  it('returns permission result when valid', async () => {
    mockPermissionService.hasPermission.mockResolvedValue(true);
    const req = new Request('http://localhost/api/permissions/check?permission=VIEW_PROJECTS');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.hasPermission).toBe(true);
    expect(mockPermissionService.hasPermission).not.toHaveBeenCalled();
  });

  it('returns 404 for invalid permission', async () => {
    const req = new Request('http://localhost/api/permissions/check?permission=UNKNOWN');
    const res = await GET(req as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('not_found');
  });

  it('returns 400 when permission missing', async () => {
    const req = new Request('http://localhost/api/permissions/check');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('validation/error');
  });

  it('maps service errors using error handler', async () => {
    mockPermissionService.hasPermission.mockRejectedValue(new Error('permission not found'));
    (withRouteAuth as any).mockImplementationOnce((handler: any, req: any) =>
      handler(req, { userId: 'user-1', user: { id: 'user-1', app_metadata: {} } })
    );
    const req = new Request('http://localhost/api/permissions/check?permission=VIEW_PROJECTS');
    const res = await GET(req as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('not_found');
  });
});
