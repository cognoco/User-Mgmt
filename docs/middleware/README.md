# Middleware Overview

This module exposes a set of reusable middleware functions used by the API routes.
Each middleware lives in `src/middleware` and can be imported individually or via
`src/middleware/registry`.

## Available middleware

| File | Purpose | Dependencies |
|------|---------|--------------|
| `auth.ts` | Adds authentication to API and route handlers. | Depends on `getApiAuthService` from `src/services/auth/factory`. |
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

Importing from `registry.ts` ensures a consistent entry point and avoids duplicate imports.
