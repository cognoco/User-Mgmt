import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '../auth-middleware';

const request = new NextRequest('http://test');

describe('createAuthMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when auth required and no user', async () => {
    const authService = { getCurrentUser: vi.fn().mockResolvedValue(null) } as any;
    const middleware = createAuthMiddleware({ authService });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const wrapped = middleware(handler);

    const res = await wrapped(request);
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('invokes handler when authenticated', async () => {
    const authService = { getCurrentUser: vi.fn().mockResolvedValue({ id: '1' }) } as any;
    const middleware = createAuthMiddleware({ authService });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const wrapped = middleware(handler);

    const res = await wrapped(request);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(request, expect.objectContaining({ userId: '1', authenticated: true }));
  });

  it('checks permissions when required', async () => {
    const authService = { getCurrentUser: vi.fn().mockResolvedValue({ id: '1' }) } as any;
    const permissionService = {
      getUserRoles: vi.fn().mockResolvedValue([{ roleId: 'r1' }]),
      getRoleById: vi.fn().mockResolvedValue({ permissions: ['EDIT'] })
    } as any;
    const middleware = createAuthMiddleware({
      authService,
      permissionService,
      requiredPermissions: ['EDIT']
    });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const wrapped = middleware(handler);

    const res = await wrapped(request);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });

  it('returns 403 when permission missing', async () => {
    const authService = { getCurrentUser: vi.fn().mockResolvedValue({ id: '1' }) } as any;
    const permissionService = {
      getUserRoles: vi.fn().mockResolvedValue([{ roleId: 'r1' }]),
      getRoleById: vi.fn().mockResolvedValue({ permissions: [] })
    } as any;
    const middleware = createAuthMiddleware({
      authService,
      permissionService,
      requiredPermissions: ['EDIT']
    });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const wrapped = middleware(handler);

    const res = await wrapped(request);
    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });
});
