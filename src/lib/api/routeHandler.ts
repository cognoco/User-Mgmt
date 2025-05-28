export interface RouteHandlerOptions<T> {
  handler: (req: import('next/server').NextRequest, ctx: import('@/middleware/auth').RouteAuthContext, data: T) => Promise<import('next/server').NextResponse>;
  schema?: import('zod').ZodSchema<T>;
  permission?: string;
  skipRateLimit?: boolean;
  parse?: (req: import('next/server').NextRequest) => Promise<unknown> | unknown;
}

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { withProtectedRoute } from '@/middleware/protected-route';
import { withValidation } from '@/middleware/validation';
import { withErrorHandling } from '@/middleware/error-handling';
import type { RouteAuthContext } from '@/middleware/auth';

export function createRouteHandler<T>(options: RouteHandlerOptions<T>) {
  const { handler, schema, permission, skipRateLimit, parse } = options;

  async function execute(req: NextRequest, ctx: RouteAuthContext) {
    const input = parse ? await parse(req) : undefined;
    if (schema) {
      return withValidation(
        schema as ZodSchema<T>,
        (r, data) => handler(r, ctx, data),
        req,
        input
      );
    }
    return handler(req, ctx, input as T);
  }

  return async function route(req: NextRequest): Promise<NextResponse> {
    return withErrorHandling(
      (r) =>
        withProtectedRoute(
          (r2, auth) => execute(r2, auth),
          { skipRateLimit, requiredPermission: permission }
        )(r),
      req
    );
  };
}
