# Supabase Integration Test Migration Guide

This document outlines best practices for updating existing authentication integration tests from the legacy **NextAuth** setup to the current **Supabase** implementation.

## 1. Preserve Test Intent

- Keep each test scenario and assertion intact. The behavioural expectations of the login, registration, permission and protected route tests should remain unchanged.
- Review the existing test descriptions to ensure they still accurately reflect the user flow after migration.

## 2. Replace NextAuth Utilities

- Update imports that previously referenced `next-auth` utilities. Replace them with the Supabase helpers provided in the codebase:
  - Use `getSupabaseServerClient` when a test needs a server-side client.
  - Use methods on `SupabaseAuthProvider` (or the service created via `createAuthProvider`) for actions such as `signInWithPassword`, `signUpWithPassword`, and `signOut`.
- Remove any direct references to `authOptions` or `NextAuth` APIs.

## 3. Session Handling

- Supabase stores sessions in a cookie specified by `SUPABASE_AUTH_COOKIE_NAME`.
- If tests previously inspected `next-auth` cookies, update them to check the Supabase cookie instead.
- Use `refreshSession` from `src/lib/auth/session` where the tests need to validate session refresh logic.

## 4. Mocking and Test Utilities

- Prefer the existing mock Supabase client found in `src/tests/mocks/supabase.ts` for unit and integration tests that require mocking the API.
- When a test previously mocked NextAuth responses, adapt the mock to mimic the shape of Supabase responses (`AuthResponse`, `UserResponse`, etc.).
- For permission checks, continue to use the permission service factory (`getApiPermissionService`) as the source of truth. No changes to assertions are necessary.

## 5. Protected Routes

- Middleware tests that relied on `getServerSession` from NextAuth should now import `getServerSession` from `src/middleware/auth-adapter`.
- The wrapper functions `withRouteAuth` and `withProtectedRoute` already use Supabase under the hood, so tests should verify they return the correct status codes and context as before.

## 6. Environment and Configuration

- Ensure the Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.) are set in the test environment.
- Check `docs/Product documentation/authentication-setup.md` for a full list of required variables and configuration details.

## 7. Maintain Coverage

- After updating tests, run `vitest run --coverage` to confirm that branch coverage for changed files remains at **90% or higher**.
- Keep tests readable by avoiding excessive mocking or implementation detail checks.

By following these guidelines, the authentication integration tests will remain stable and maintainable while reflecting the project's migration from NextAuth to Supabase.
