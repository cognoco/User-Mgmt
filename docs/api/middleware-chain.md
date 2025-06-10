# Middleware Chain Usage

This document explains how to use the middleware chain utilities located in `src/middleware/createMiddlewareChain.ts`.

`createMiddlewareChain` composes small middleware functions into a single handler. Each middleware receives a handler function and returns a new handler that wraps additional behavior. Middleware is executed in the order provided when creating the chain.

## Built‑in Middleware Factories

The module exposes helpers that adapt existing utilities to the chain pattern:

- **`errorHandlingMiddleware()`** &ndash; wraps a handler with `withErrorHandling` to return consistent error responses.
- **`routeAuthMiddleware(options?)`** &ndash; uses `withRouteAuth` to attach authentication context. Accepts {@link RouteAuthOptions}.
- **`validationMiddleware(schema)`** &ndash; validates request data using a Zod schema before calling the handler.
- **`rateLimitMiddleware(options?)`** &ndash; applies rate limiting via `createRateLimit`.

Import these helpers from the same file alongside `createMiddlewareChain`.

### Standard Compositions

Common middleware stacks are provided for convenience. The most frequently used
is `standardApiMiddleware`, which applies rate limiting, error handling,
authentication and validation in that order.

```ts
import { standardApiMiddleware } from '@/middleware/createMiddlewareChain';

const middleware = standardApiMiddleware(mySchema);
```

## Example

```ts
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
} from '@/middleware/createMiddlewareChain';
import { withSecurity } from '@/middleware/with-security';
import { mySchema } from '@/lib/validation';

const baseMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['team.read'] }),
  validationMiddleware(mySchema),
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
]);

export const POST = (req: NextRequest) =>
  withSecurity((r) =>
    baseMiddleware((r2, auth, data) => handlePost(r2, auth, data))(r)
  )(req);
```

Different routes can create separate chains depending on their needs. For example, a GET handler might skip validation while a POST handler includes it.

## Usage Tips

- Place shared middleware (e.g., `errorHandlingMiddleware()` or `routeAuthMiddleware()`) at the start of the chain so all subsequent middleware run within the same error and auth context.
- `validationMiddleware` passes the parsed data as the third argument to your handler.
- When combined with `withSecurity` or other wrappers, call the middleware chain inside the wrapper as shown in the example.

These utilities help keep API route handlers concise and consistent across the code base.
