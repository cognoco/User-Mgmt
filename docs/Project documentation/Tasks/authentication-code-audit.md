# Authentication Code Audit

This document maps authentication related code under the main application directories and highlights where Supabase Auth is not used.

## app/lib/auth (`src/lib/auth`)

| File | Supabase Usage | Notes |
| ---- | -------------- | ----- |
| `authConfig.ts` | ❌ | Placeholder configuration, mentions NextAuth. |
| `index.ts` | ❌ | Implements NextAuth credentials provider with Prisma. |
| `getUser.ts` | ❌ | Retrieves user using NextAuth session and Prisma. |
| `session.ts` | ❌ | Mock session helper, comments reference Supabase but none used. |
| `utils.ts` | ➖ | Uses NextAuth `getServerSession`; falls back to Supabase client when header token exists. |
| `domainMatcher.ts` | ✅ | Uses Supabase service client to match company domains. |
| `UserManagementClientBoundary.tsx` | ✅ | Listens to Supabase auth state changes on the client. |
| `UserManagementProvider.tsx` | ❌ | Provides context; no Supabase calls. |
| `hasPermission.ts` | ❌ | Checks permissions via Prisma. |

## app/api/auth

Most API routes obtain an `AuthService` via `getApiAuthService()` which in turn uses the `SupabaseAuthProvider`. These routes therefore rely on Supabase. Notable files:

- `login/route.ts`
- `logout/route.ts`
- `register/route.ts`
- `update-password/route.ts`
- `reset-password/route.ts`
- `send-verification-email/route.ts`
- `verify-email/route.ts`
- `refresh-token/route.ts`
- `setup-mfa/route.ts`
- `verify-mfa/route.ts`
- `disable-mfa/route.ts`

OAuth related routes additionally interact with Prisma to store account records:

- `oauth/link/route.ts`
- `oauth/callback/route.ts`
- `oauth/disconnect/route.ts`

These mix Supabase session handling with direct Prisma access.

## middleware (`src/middleware`)

| File | Supabase Usage | Notes |
| ---- | -------------- | ----- |
| `auth.ts` | ✅ | Validates bearer token with `supabase.auth.getUser`; provides `withRouteAuth` wrapper using `getApiAuthService()`. |
| `with-auth-rate-limit.ts` | ❌ | Rate limiting helper only. |
| `permissions.ts` | ❌ | Uses `getServerSession` from NextAuth and Prisma role checks. |
| Other middleware (`cors.ts`, `security-headers.ts`, etc.) | ❌ | Not directly related to authentication. |

## Locations Not Using Supabase Auth

- `src/lib/auth/index.ts`
- `src/lib/auth/getUser.ts`
- `src/lib/auth/hasPermission.ts`
- `src/lib/auth/session.ts`
- `src/middleware/permissions.ts`
- OAuth routes under `app/api/auth/oauth` use Prisma for account data in addition to Supabase.
- Various helper components or providers that rely solely on NextAuth or Prisma.

