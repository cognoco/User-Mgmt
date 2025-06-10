# Updating Route Tests from NextAuth to Supabase

This guide outlines a step-by-step approach for migrating API route tests that still rely on NextAuth session mocks. It draws on existing testing utilities and mocking patterns in the repository.

## 1. Locate Tests Using NextAuth Mocks

1. Search for imports or mocks referencing `next-auth` or `getServerSession` from NextAuth:
   ```bash
   grep -R "next-auth" app | grep "__tests__"
   grep -R "getServerSession" app | grep "__tests__"
   ```
2. Review the found files (team routes, invitation flows, admin routes, permission checks) and confirm they create a mock `Session` object shaped like NextAuth's session.

## 2. Understand the Supabase Session Helper

The new `getServerSession` in `src/middleware/auth-adapter.ts` provides a Supabase-based session object:

```ts
 42  * Replacement for `next-auth`'s `getServerSession` using Supabase auth.
 46  export async function getServerSession(
 49    const baseSession: CurrentSession | null = req
 55    return buildSession(baseSession);
```
【F:src/middleware/auth-adapter.ts†L40-L56】

Tests should use this helper together with the Supabase client mock found in `src/tests/mocks/supabase.ts`. The mock implements Supabase's query‑builder chain and authentication methods.

```ts
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'test@example.com' } }, error: null }) as Mock,
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'test@example.com' }, session: { access_token: 'test-token' } }, error: null }) as Mock,
    // ...other auth methods
  },
  // ...storage and query builder mocks
};
export const supabase = mockSupabase as unknown as SupabaseClient;
```
【F:src/tests/mocks/supabase.ts†L388-L536】

Utilities like `mockAuthState` in `src/tests/utils/component-testing-utils.ts` demonstrate how to mock authenticated and unauthenticated states using this Supabase client:

```ts
17   * Sets up authentication mocks for component testing
21  export function mockAuthState(user = null, loading = false) {
24      supabase.auth.getUser.mockResolvedValue({ data: { user }, error: null });
37    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
55      triggerAuthChange: (event, session) => {
```
【F:src/tests/utils/component-testing-utils.ts†L17-L55】

## 3. Replace NextAuth Mocks with Supabase Mocks

For each identified test file:

1. **Remove** imports from `next-auth` and any `Session` type declarations.
2. **Import** `supabase` from `@/tests/mocks/supabase` and `getServerSession` from `@/middleware/auth-adapter`.
3. **Create** mock sessions using the structure returned by `getServerSession` (see `AdapterSession` interface in `auth-adapter.ts`).
4. **Mock authentication behaviour** using `mockAuthState` or directly stubbing `supabase.auth` methods.
5. **Ensure** permission checks use the mock permission service as in existing tests (see `auth-adapter.test.ts` lines 20‑54 for reference).

## 4. Update Assertions

- Replace assertions that expect NextAuth-specific fields with the Supabase session shape (`user.id`, `user.email`, `user.role`, `user.permissions`).
- Verify both success and failure paths (e.g., 401 when no session, 403 for insufficient permissions) remain covered.

## 5. Maintain Test Coverage

The repository enforces running `vitest run --coverage` and achieving at least 90 % branch coverage for changed files, as stated in the project guidelines.

## 6. Common Patterns

### Authenticated User
```ts
vi.mock('@/middleware/auth-adapter', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'admin@example.com', role: 'ADMIN', permissions: ['TEAM_VIEW'] }
  })
}));
```

### Unauthenticated Request
```ts
vi.mock('@/middleware/auth-adapter', () => ({
  getServerSession: vi.fn().mockResolvedValue(null)
}));
```

### Permission Checking
Mock `getApiPermissionService` so `hasPermission` returns the desired boolean:
```ts
vi.mock('@/services/permission/factory', () => ({
  getApiPermissionService: () => ({
    hasPermission: vi.fn().mockResolvedValue(true)
  })
}));
```

### Different Roles
Adjust the `role` value in the mocked session to test admin vs. user paths. Use the permission service mock above to control access outcomes.

## 7. Verify and Refactor

1. Run the updated tests with `pnpm test` or `vitest run`.
2. Ensure coverage thresholds pass.
3. Remove any leftover references to NextAuth in the codebase.

Following this approach keeps business logic assertions intact while modernising authentication handling in all route tests.
