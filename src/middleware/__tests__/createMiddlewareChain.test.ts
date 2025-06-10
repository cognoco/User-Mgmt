import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

vi.mock('../auth', () => ({
  withRouteAuth: vi.fn(async (handler: any, req: NextRequest) => {
    return handler(req, { userId: '1' });
  })
}));

vi.mock('../error-handling', () => ({
  withErrorHandling: vi.fn(async (handler: any, req: NextRequest) => handler(req))
}));

vi.mock('../validation', () => ({
  withValidation: vi.fn(async (_schema: any, handler: any, req: NextRequest) =>
    handler(req, { name: 'valid' })
  )
}));

vi.mock('../rate-limit', () => ({
  createRateLimit: vi.fn(() =>
    vi.fn(async (_req: NextRequest, handler: any) => handler(req))
  )
}));

import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
  standardApiMiddleware,
  createMiddlewareChainFromConfig,
  type RouteMiddleware,
} from '@/middleware/createMiddlewareChain';
import {
  configureApiRoutes,
  resetApiRoutesConfig,
} from '@/config/apiRoutes.config';
import { withRouteAuth } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withValidation } from '@/middleware/validation';
import { createRateLimit } from '@/middleware/rateLimit';

const req = new NextRequest('http://test');

describe('createMiddlewareChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetApiRoutesConfig();
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
    expect(handler).toHaveBeenCalledWith(req, { userId: '1' }, undefined);
    expect(withRouteAuth).toHaveBeenCalled();
    expect(withErrorHandling).toHaveBeenCalled();
  });

  it('passes validated data to the handler', async () => {
    const chain = createMiddlewareChain([
      validationMiddleware({} as any),
    ]);

    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(withValidation).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(req, undefined, { name: 'valid' });
  });

  it('applies rate limiting before calling handler', async () => {
    const limitFn = vi.fn(async (_req: NextRequest, h: any) => h(req));
    vi.mocked(createRateLimit).mockReturnValue(limitFn);

    const chain = createMiddlewareChain([
      rateLimitMiddleware(),
    ]);

    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(createRateLimit).toHaveBeenCalled();
    expect(limitFn).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('creates middleware chain from valid config', async () => {
    const chain = createMiddlewareChainFromConfig({
      auth: { optional: true },
      validationSchema: z.object({}),
      rateLimit: { max: 5 },
    });

    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(withRouteAuth).toHaveBeenCalled();
    expect(withValidation).toHaveBeenCalled();
    expect(createRateLimit).toHaveBeenCalledWith({ max: 5 });
    expect(withErrorHandling).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('merges global defaults for route type', async () => {
    configureApiRoutes({
      protected: { errorHandling: true, auth: {} },
    });

    const chain = createMiddlewareChainFromConfig({}, 'protected');
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(withRouteAuth).toHaveBeenCalled();
    expect(withErrorHandling).toHaveBeenCalled();
  });

  it('exposes a standard auth middleware composition', async () => {
    const chain = standardApiMiddleware({} as any);
    const handler = vi.fn().mockResolvedValue(new NextResponse('ok'));
    const res = await chain(handler)(req);

    expect(res.status).toBe(200);
    expect(createRateLimit).toHaveBeenCalled();
    expect(withErrorHandling).toHaveBeenCalled();
    expect(withRouteAuth).toHaveBeenCalled();
    expect(withValidation).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('throws on invalid config', () => {
    expect(() =>
      createMiddlewareChainFromConfig({ rateLimit: { max: -1 } } as any)
    ).toThrow();
  });
});
