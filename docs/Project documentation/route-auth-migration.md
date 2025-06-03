# API Route Authentication Migration Guide

This document outlines how to migrate existing API routes to the new middleware based authentication pattern. The goal is a consistent approach for securing routes while keeping handlers concise.

## New Authentication Pattern

Routes now use `createApiHandler` from `src/lib/api/route-helpers.ts`. This utility wraps handlers with `createAuthMiddleware` which:

1. Reads the bearer token from the `Authorization` header or cookie.
2. Loads the Supabase user via `getServiceSupabase`.
3. Adds a typed auth context containing `userId`, optional user info and permissions.
4. Returns `401` if authentication is required but no valid token is found.

Handlers receive the auth context as the second argument. Optional Zod validation is performed before the handler is executed.

```ts
export const GET = createApiHandler(
  z.object({}),
  async (_req, { userId }) => {
    const service = getApiUserService();
    const profile = await service.getUserProfile(userId);
    return createSuccessResponse(profile);
  },
  { requireAuth: true }
);
```

## Migrating Existing Routes

1. **Replace old wrappers** like `withRouteAuth`, `withValidation` and `withErrorHandling` with a single `createApiHandler` call.
2. **Define a Zod schema** for any request body or query parameters. Use `z.object({})` when no data is expected.
3. **Implement the handler** with the signature `(req, context, data)`.
4. **Specify options** such as `requireAuth`, `requiredPermissions` or `includeUser` when creating the handler.
5. **Remove custom error helpers** unless the route has domain specific errors.

## Common Patterns

- **Authenticated GET**
  ```ts
  export const GET = createApiHandler(z.object({}), myHandler, { requireAuth: true });
  ```
- **Authenticated POST with validation**
  ```ts
  const schema = z.object({ name: z.string() });
  export const POST = createApiHandler(schema, createItem, { requireAuth: true });
  ```
- **Public route**
  ```ts
  export const GET = createApiHandler(z.object({}), fetchPublicData, { requireAuth: false });
  ```

## Migration Timeline

1. **Phase 1 – New routes**: All newly created routes must use `createApiHandler` immediately.
2. **Phase 2 – Existing routes**: Update high traffic endpoints first. Aim to convert at least 50 % within the next sprint.
3. **Phase 3 – Cleanup**: Remove deprecated wrappers after all routes have been migrated (target: two sprints from start).

## Testing Requirements

- Unit tests for migrated routes must mock `createAuthMiddleware` to supply an auth context.
- Use `createAuthenticatedRequest` from `src/tests/utils/request-helpers.ts` for constructing `NextRequest` objects.
- Run `vitest run --coverage` and ensure branch coverage for changed files is at least **90 %**.
- Update any integration or E2E tests that relied on old authentication helpers.

Following these guidelines will ensure a smooth transition to the unified authentication system.
