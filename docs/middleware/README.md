# Middleware Overview

This module exposes a set of reusable middleware functions used by the API routes.
Each middleware lives in `src/middleware` and can be imported individually or via
`src/middleware/registry`.

## Available middleware

| File | Purpose | Dependencies |
|------|---------|--------------|
| `auth.ts` | Adds authentication to API and route handlers. | Depends on `getApiAuthService` from `src/services/auth/factory`. |
| `auth-adapter.ts` | Compatibility layer replacing NextAuth functions with Supabase equivalents. | Permission service, auth session |
| `audit-log.ts` | Logs API requests and responses for auditing. | Uses `supabase` client from `src/lib/database/supabase`. |
| `cors.ts` | Adds CORS headers and handles preflight requests. | None |
| `csrf.ts` | Provides CSRF protection for API routes. | `ApiError` from `src/lib/api/common`. |
| `error-handling.ts` | Formats API errors into consistent responses. | `ApiError` utilities. |
| `export-rate-limit.ts` | Limits export requests by user or company. | Export services under `src/lib/exports`. |
| `index.ts` | Helper utilities for composing middleware stacks. | Relies on other middleware in this folder. |
| `permissions.ts` | Checks user permissions for protected routes. | Auth and permission services. |
| `rate-limit.ts` | General purpose rate limiting using Redis or LRU cache. | `@upstash/redis`, `lru-cache`, config in `src/lib/config`. |
| `security-headers.ts` | Adds common security headers. | None |
| `validation.ts` | Validates request bodies using Zod schemas. | `zod`, `ApiError` utilities. |
| `with-auth-rate-limit.ts` | Convenience wrapper applying strict rate limits to auth endpoints. | `createRateLimit` from `rate-limit.ts`. |
| `with-security.ts` | Middleware for App Router route handlers adding security headers and CSRF protection. | None |
| `protected-route.ts` | Combines rate limiting, authentication and optional permission checks. | `checkRateLimit`, `withRouteAuth` |

Importing from `registry.ts` ensures a consistent entry point and avoids duplicate imports.

## Auth Adapter Usage

The `auth-adapter.ts` module provides `getServerSession` and re-exports `withRouteAuth`.
It serves as a drop-in replacement for `next-auth` utilities while using Supabase
sessions under the hood.

```ts
import { getServerSession } from '@/middleware/auth-adapter';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // session.user contains id, role and permissions
  return NextResponse.json({ userId: session.user.id });
}
```

When composing middleware chains you can continue to use `withRouteAuth` from the
same module:

```ts
import { withRouteAuth } from '@/middleware/auth-adapter';

export const POST = (req: NextRequest) =>
  withRouteAuth((r, ctx) => handler(r, ctx), req);
```

## Extracting the authenticated user

`withRouteAuth` populates a `RouteAuthContext` object for the handler. To access the full Supabase user (including email), enable `includeUser` when applying the middleware:

```ts
const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ includeUser: true })
]);

export const POST = middleware((req, auth) => {
  // auth.user contains the authenticated Supabase user
});
```
