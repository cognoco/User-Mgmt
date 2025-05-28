# Authentication Role Structure

## Overview

This document outlines how authentication and role-based permissions work in our application.

## User Object Structure

Authenticated users have the following structure in our system:

```javascript
{
  id: 'user-id',
  email: 'user@example.com',
  role: 'authenticated',      // This is from Supabase, not our custom role
  app_metadata: {
    role: 'admin'            // This is our custom role used for permissions
  }
}
```

## Permission Extraction

When routes use `withRouteAuth`, the returned context includes the Supabase user
object. Custom roles and permissions are stored in `user.app_metadata`.

1. Call `withRouteAuth` with `{ includeUser: true }` to access the full user.
2. Read `user.app_metadata.permissions` for assigned permissions.
3. If no permissions are present, fall back to the permission service for a
   database lookup.

This approach keeps our RBAC service in place while enabling quick checks from
token metadata.
