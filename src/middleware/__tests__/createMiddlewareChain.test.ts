import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('../auth', () => ({
  withRouteAuth: vi.fn(async (handler: any, req: NextRequest) => {
    return handler(req, { userId: '1' });
  })
}));

vi.mock('../error-handling', () => ({
  withErrorHandling: vi.fn(async (handler: any, req: NextRequest) => handler(req))
}));

import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  type RouteMiddleware,
} from '../createMiddlewareChain';
import { withRouteAuth } from '../auth';
import { withErrorHandling } from '../error-handling';

const req = new NextRequest('http://test');

describe('createMiddlewareChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes middleware in the given order', async () => {
    const order: string[] = [];
    const mw1: RouteMiddleware = (handler) => async (r) => {
      order.push('mw1-before');
      const res = await handler(r);
      order.push('mw1-after');
      return res;
    };
    const mw2: RouteMiddleware = (handler) => async (r) => {
      order.push('mw2-before');
      const res = await handler(r);
      order.push('mw2-after');
      return res;
    };

    const chain = createMiddlewareChain([mw1, mw2]);
    const handler = vi.fn().mockResolvedValue(new NextResponse(null, { status: 200 }));

    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(order).toEqual(['mw1-before', 'mw2-before', 'mw2-after', 'mw1-after']);
  });

  it('adapts routeAuth and errorHandling helpers', async () => {
    const chain = createMiddlewareChain([
      errorHandlingMiddleware(),
      routeAuthMiddleware(),
    ]);

    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(req, { userId: '1' });
    expect(withRouteAuth).toHaveBeenCalled();
    expect(withErrorHandling).toHaveBeenCalled();
  });
});
