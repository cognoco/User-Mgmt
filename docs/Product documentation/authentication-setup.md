# Authentication Setup

This guide explains how the new Supabase-based authentication works and how to migrate existing code.

## Authentication Flow

1. **Registration**
   - Users sign up with email and password via the Supabase client.
   - A verification email is sent automatically if email confirmation is enabled.
2. **Login**
   - Credentials are submitted to the Supabase auth API.
   - On success the session is stored in a cookie defined by `SUPABASE_AUTH_COOKIE_NAME`.
3. **Session Refresh**
   - The client automatically refreshes expired access tokens when `SUPABASE_AUTO_REFRESH_TOKEN` is enabled.
4. **Logout**
   - Calling `signOut` invalidates the session on the server and clears the cookie.

## Provider Options and Configuration

The module uses an `AuthDataProvider` interface to decouple authentication providers.
The default implementation is `SupabaseAuthProvider`.

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public anon key (required)
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for server calls
- `SUPABASE_AUTH_COOKIE_NAME` – cookie name for the session (default `sb-access-token`)
- `SUPABASE_AUTH_COOKIE_LIFETIME_DAYS` – session lifetime in days (default `7`)
- `SUPABASE_AUTO_REFRESH_TOKEN` – enable automatic token refresh (default `true`)
- `SUPABASE_PERSIST_SESSION` – persist session across tabs (default `true`)

### Switching Providers

Use `createAuthProvider` from `src/adapters/auth/factory.ts` to supply a custom provider.
Provide the provider type and any options:

```typescript
import { createAuthProvider } from '@/adapters/auth/factory';

const authProvider = createAuthProvider({
  type: 'supabase',
  options: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
```

Implementations for other services can conform to the `AuthDataProvider` interface.

## Migration Notes

Legacy code relied on NextAuth configuration exported as `authOptions`.
The new setup keeps this export as an empty object to avoid breaking imports.
Update any `next-auth` logic to use the Supabase utilities instead:

- Replace calls to `NextAuth` with `getSupabaseServerClient` and the methods on `SupabaseAuthProvider`.
- Ensure environment variables listed above are set.
- Old `SESSION_COOKIE_NAME` is still read to support existing cookies but should be removed after migration.

## Troubleshooting

- **Missing environment variables** – run `validateSupabaseAuthConfig()` to log any unset variables.
- **Session not persisted** – check `SUPABASE_AUTH_COOKIE_NAME` and lifetime settings.
- **OAuth errors** – verify provider credentials in the Supabase dashboard.
- **Unexpected sign-outs** – confirm `SUPABASE_AUTO_REFRESH_TOKEN` is not disabled and that server time is correct.
