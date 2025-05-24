import { NextRequest, NextResponse } from 'next/server';

/**
 * Utility to compose multiple middleware functions for route handlers.
 */
export function composeMiddleware(
  ...middlewares: Array<(handler: any, req: NextRequest) => Promise<NextResponse>>
) {
  return (
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) => {
    return (req: NextRequest) => {
      return middlewares.reduceRight(
        (acc, middleware) => () => middleware(acc, req),
        (req: NextRequest) => handler(req)
      )(req);
    };
  };
}
