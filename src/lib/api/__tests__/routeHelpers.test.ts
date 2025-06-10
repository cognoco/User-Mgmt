import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

vi.mock('../../auth/unified-auth.middleware', () => ({
  createAuthMiddleware: vi.fn((opts: any) => (handler: any) => handler)
}));

const { createAuthMiddleware } = await import('@/lib/auth/unifiedAuth.middleware');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createApiHandler', () => {
  it('passes services to handler and calls auth middleware with options', async () => {
    const schema = z.object({ name: z.string() });
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const { createApiHandler } = await import('@/lib/api/routeHelpers');
    const mockAuth = {} as any;
    const mockUser = {} as any;
    const apiHandler = createApiHandler(schema, handler, {
      requireAuth: true,
      services: { auth: mockAuth, user: mockUser }
    });
    const req = new NextRequest(new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'A' }) }));
    const res = await apiHandler(req);
    expect(createAuthMiddleware).toHaveBeenCalledWith(expect.objectContaining({ authService: mockAuth, requireAuth: true }));
    expect(handler).toHaveBeenCalledWith(
      req,
      expect.any(Object),
      { name: 'A' },
      expect.objectContaining({ auth: mockAuth, user: mockUser })
    );
    expect(res.status).toBe(200);
  });

  it('returns validation error for invalid data', async () => {
    const schema = z.object({ name: z.string() });
    const handler = vi.fn();
    const { createApiHandler } = await import('@/lib/api/routeHelpers');
    const apiHandler = createApiHandler(schema, handler);
    const req = new NextRequest(new Request('http://test', { method: 'POST', body: JSON.stringify({}) }));
    const res = await apiHandler(req);
    expect(res.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });
});
