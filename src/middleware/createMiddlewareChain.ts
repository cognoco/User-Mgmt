import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from './error-handling';
import { withRouteAuth, type RouteAuthOptions } from './auth';
import { withValidation } from './validation';
import type { ZodSchema } from 'zod';
import { createRateLimit, type RateLimitOptions } from './rate-limit';

export type RouteHandler = (
  req: NextRequest,
  ctx?: any,
  data?: any
) => Promise<NextResponse>;
export type RouteMiddleware = (handler: RouteHandler) => RouteHandler;

/**
 * Creates a middleware chain from the provided middleware functions.
 * The middleware will execute in the order supplied.
 */
export function createMiddlewareChain(middlewares: RouteMiddleware[]): RouteMiddleware {
  return middlewares.reduceRight<RouteMiddleware>(
    (next, mw) => (handler) => mw(next(handler)),
    (handler) => handler
  );
}

/** Adapts `withErrorHandling` to {@link RouteMiddleware}. */
export function errorHandlingMiddleware(): RouteMiddleware {
  return (handler: RouteHandler): RouteHandler =>
    (req: NextRequest, ctx?: any, data?: any) =>
      withErrorHandling((r) => handler(r, ctx, data), req);
}

/** Adapts `withRouteAuth` to {@link RouteMiddleware}. */
export function routeAuthMiddleware(options?: RouteAuthOptions): RouteMiddleware {
  return (handler: RouteHandler): RouteHandler =>
    (req: NextRequest, _ctx?: any, data?: any) =>
      withRouteAuth((r, authCtx) => handler(r, authCtx, data), req, options);
}

/** Adapts `withValidation` to {@link RouteMiddleware}. */
export function validationMiddleware<T>(schema: ZodSchema<T>): RouteMiddleware {
  return (handler: RouteHandler): RouteHandler =>
    (req: NextRequest, ctx?: any) =>
      withValidation(schema, (r, data) => handler(r, ctx, data), req);
}

/** Adapts `createRateLimit` to {@link RouteMiddleware}. */
export function rateLimitMiddleware(
  options?: RateLimitOptions
): RouteMiddleware {
  const limiter = createRateLimit(options);
  return (handler: RouteHandler): RouteHandler =>
    (req: NextRequest, ctx?: any, data?: any) =>
      limiter(req, (r) => handler(r, ctx, data));
}
