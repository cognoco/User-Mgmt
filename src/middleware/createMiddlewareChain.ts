import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from './error-handling';
import { withRouteAuth, type RouteAuthOptions } from './auth';

export type RouteHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse>;
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
  return (handler: RouteHandler): RouteHandler => (req: NextRequest) =>
    withErrorHandling((r) => handler(r), req);
}

/** Adapts `withRouteAuth` to {@link RouteMiddleware}. */
export function routeAuthMiddleware(options?: RouteAuthOptions): RouteMiddleware {
  return (handler: RouteHandler): RouteHandler => (req: NextRequest) =>
    withRouteAuth((r, ctx) => handler(r, ctx), req, options);
}
