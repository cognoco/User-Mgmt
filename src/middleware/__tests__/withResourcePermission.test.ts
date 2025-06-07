import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withResourcePermission } from '@/src/middleware/withResourcePermission'122;
import { withRouteAuth } from '@/src/middleware/auth'191;
import { createAuthApiError } from '@/src/middleware/authErrors'233;
import { createErrorResponse } from '@/lib/api/common/responseFormatter'287;

vi.mock('../auth');
vi.mock('../auth-errors');
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));
vi.mock('@/lib/api/common/response-formatter');

const mockRequest = new NextRequest(new URL('http://localhost'));

const mockHandler = vi.fn().mockResolvedValue(new NextResponse('ok'));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('withResourcePermission', () => {
  it('returns 401 when no user id', async () => {
    vi.mocked(withRouteAuth).mockImplementation(async (h, req) => h(req, { userId: null } as any));
    vi.mocked(createAuthApiError).mockReturnValue({ code: 'E', message: 'auth', status: 401 } as any);
    vi.mocked(createErrorResponse).mockImplementation((err: any) => new NextResponse(err.message, { status: err.status }));

    const middleware = withResourcePermission(mockHandler, { permission: 'test' });
    const res = await middleware(mockRequest, { params: {} });
    expect(res.status).toBe(401);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('denies when checkAccess returns false', async () => {
    vi.mocked(withRouteAuth).mockImplementation(async (h, req) => h(req, { userId: '1' } as any));
    vi.mocked(createAuthApiError).mockReturnValue({ code: 'E', message: 'forbidden', status: 403 } as any);
    vi.mocked(createErrorResponse).mockImplementation((err: any) => new NextResponse(err.message, { status: err.status }));

    const middleware = withResourcePermission(mockHandler, {
      permission: 'test',
      checkAccess: () => false,
    });
    const res = await middleware(mockRequest, { params: {} });
    expect(res.status).toBe(403);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('calls handler when authorized', async () => {
    vi.mocked(withRouteAuth).mockImplementation(async (h, req) => h(req, { userId: '1' } as any));
    const middleware = withResourcePermission(mockHandler, {
      permission: 'test',
      checkAccess: () => true,
    });
    await middleware(mockRequest, { params: {} });
    expect(mockHandler).toHaveBeenCalled();
  });
});
