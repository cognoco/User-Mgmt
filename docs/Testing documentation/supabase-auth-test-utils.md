# Supabase Auth Test Utilities

This document explains the helper functions in
`src/tests/utils/supabase-auth-utils.ts` used for testing
Supabase authentication logic.

## Overview

The utilities provide a lightweight way to generate tokens, create mock
Supabase users and sessions, and simulate common authentication states or
errors. They are designed to work with the global Supabase mock defined in
`src/tests/mocks/supabase.ts`.

## API

### `generateTestJwt(payload?: Record<string, unknown>): string`
Returns a base64 encoded string representing a simple JWT payload. It is
**not** cryptographically signed and should only be used in tests.

### `createMockSupabaseUser(overrides?: Partial<User>): User`
Creates a mock `User` object with sensible defaults. Pass an object to
`overrides` to customise specific fields, such as the custom role stored in
`app_metadata`.

### `createMockSupabaseSession(user?: User, overrides?: Partial<Session>): Session`
Generates a mock `Session` for the supplied user. You can override any of the
session fields if needed.

### `mockSupabaseUserRole(role: string, overrides?: Partial<User>): User`
Configures the Supabase client mock so that `supabase.auth.getUser` resolves to a
user with the specified role. Returns the generated user for convenience.

### `mockAuthError(message?: string): AuthError`
Forces `supabase.auth.getUser` to reject with an authentication error. Useful for
error and edge case tests.

### `mockExpiredToken()`
Convenience wrapper around `mockAuthError('Token expired')`.

## Example

```ts
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';
import {
  mockSupabaseUserRole,
  generateTestJwt,
} from '@/tests/utils/supabase-auth-utils';

// Mock an admin user
const admin = mockSupabaseUserRole('admin');

// Create a request with a matching token
const token = generateTestJwt({ sub: admin.id });
const req = createAuthenticatedRequest('GET', '/api/admin', undefined, token);
```

These helpers should make it straightforward to cover any authentication
scenario in your tests.
