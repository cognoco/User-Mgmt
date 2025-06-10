# Auth Configuration Module

This document explains how to work with the `authEnvironment` utilities used to
configure authentication related features.

## Overview

`src/lib/auth/authEnvironment.ts` centralizes access to all authentication
environment variables. It exposes helper methods that make it easy to create
Supabase clients or validate that required variables are present.

## Available Environment Variables

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (required) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key used in the browser (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server operations |
| `SESSION_COOKIE_NAME` | Name of the cookie storing the access token |
| `TOKEN_EXPIRY_DAYS` | Lifetime of refresh tokens in days |

## Usage

```typescript
import {
  authEnv,
  validateAuthEnv,
  getSupabaseClientConfig,
  getSupabaseServerConfig
} from '@/lib/auth/authEnvironment';

if (!validateAuthEnv()) {
  throw new Error('Invalid authentication configuration');
}

const clientOpts = getSupabaseClientConfig();
const serverOpts = getSupabaseServerConfig();
```

`validateAuthEnv` should run during application startup to ensure the expected
environment variables are defined. The helper methods can then be used wherever a
Supabase client is created.

