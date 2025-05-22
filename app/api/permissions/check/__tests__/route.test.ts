import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';

const mockAuthService = {
  getSession: vi.fn(),
};
vi.mock('@/lib/api/auth/factory', () => ({
  getApiAuthService: () => mockAuthService,
}));

const mockPermissionService = {
  hasPermission: vi.fn(),
};
vi.mock('@/lib/api/permission/factory', () => ({
  getApiPermissionService: () => mockPermissionService,
}));

vi.mock('@/lib/api/permission/error-handler', async () => {
  return await vi.importActual('@/lib/api/permission/error-handler');
});

beforeEach(() => {
  vi.resetAllMocks();
  mockAuthService.getSession.mockResolvedValue({ user: { id: 'user-1' } });
});

describe('GET /api/permissions/check', () => {
  it('returns permission result when valid', async () => {
    mockPermissionService.hasPermission.mockResolvedValue(true);
    const req = new Request('http://localhost/api/permissions/check?permission=VIEW_PROJECTS');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.hasPermission).toBe(true);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith('user-1', 'VIEW_PROJECTS');
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
    const req = new Request('http://localhost/api/permissions/check?permission=VIEW_PROJECTS');
    const res = await GET(req as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('not_found');
  });
});
