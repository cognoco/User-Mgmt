# User Management Module - APIs & Services Checklist

This checklist tracks the existence of API endpoints for the User Management Module. Authentication endpoints are verified below. Each entry lists the expected route path and whether a corresponding `route.ts` file currently exists in the repository.

## Authentication API Endpoints

| Endpoint Path | File Path | Exists? |
|---------------|----------|---------|
| `/api/auth/login` | `app/api/auth/login/route.ts` | ✅ |
| `/api/auth/register` | `app/api/auth/register/route.ts` | ✅ |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | ✅ |
| `/api/auth/reset-password` | `app/api/auth/reset-password/route.ts` | ✅ |
| `/api/auth/update-password` | `app/api/auth/update-password/route.ts` | ✅ |
| `/api/auth/send-verification-email` | `app/api/auth/send-verification-email/route.ts` | ✅ |
| `/api/auth/refresh-token` | _(missing)_ | ❌ |
| `/api/auth/verify-email` | _(missing)_ | ❌ |
| `/api/auth/delete-account` | _(missing)_ | ❌ |
| `/api/auth/setup-mfa` | _(missing)_ | ❌ |
| `/api/auth/verify-mfa` | _(missing)_ | ❌ |
| `/api/auth/disable-mfa` | _(missing)_ | ❌ |
| `/api/auth/mfa/enable` | _(missing)_ | ❌ |
| `/api/auth/mfa/disable` | _(missing)_ | ❌ |
| `/api/auth/mfa/verify` | `app/api/auth/mfa/verify/route.ts` | ✅ |
| `/api/auth/oauth` | `app/api/auth/oauth/route.ts` | ✅ |
| `/api/auth/oauth/callback` | `app/api/auth/oauth/callback/route.ts` | ✅ |
| `/api/auth/oauth/link` | `app/api/auth/oauth/link/route.ts` | ✅ |
| `/api/auth/oauth/disconnect` | `app/api/auth/oauth/disconnect/route.ts` | ✅ |
| `/api/auth/csrf` | `app/api/auth/csrf/route.ts` | ✅ |
| `/api/auth/account` | `app/api/auth/account/route.ts` | ✅ |

