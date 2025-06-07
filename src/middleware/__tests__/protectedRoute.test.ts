import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withProtectedRoute } from '@/src/middleware/protectedRoute';
import { checkRateLimit } from '@/src/middleware/rateLimit';
import { withRouteAuth } from '@/src/middleware/auth';

vi.mock('../rate-limit');
vi.mock('../auth');

const mockReq = new NextRequest('http://test');

describe('withProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(true);
    const handler = vi.fn();
    const res = await withProtectedRoute(handler)(mockReq);
    expect(res.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it('skips rate limiting when option set', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(true);
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const authCtx = { userId: '1', role: 'user', permissions: [] } as any;
    vi.mocked(withRouteAuth).mockImplementation(async (h, req) => h(req, authCtx));
    const res = await withProtectedRoute(handler, { skipRateLimit: true })(mockReq);
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(mockReq, authCtx, undefined);
  });

  it('calls handler with auth context', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);
    const authCtx = { userId: '1', role: 'user', permissions: [] } as any;
    vi.mocked(withRouteAuth).mockImplementation(async (h, req) => h(req, authCtx));
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await withProtectedRoute(handler)(mockReq);
    expect(withRouteAuth).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(mockReq, authCtx, undefined);
    expect(res.status).toBe(200);
  });

  it('passes permission option to withRouteAuth', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue(false);
    vi.mocked(withRouteAuth).mockResolvedValue(new NextResponse('forbidden', { status: 403 }));
    const res = await withProtectedRoute(() => Promise.resolve(new NextResponse('ok')), { requiredPermission: 'edit' })(mockReq);
    expect(withRouteAuth).toHaveBeenCalledWith(expect.any(Function), mockReq, { requiredPermissions: ['edit'] });
    expect(res.status).toBe(403);
  });
});
