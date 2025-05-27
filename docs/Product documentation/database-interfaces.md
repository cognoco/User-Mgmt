# Core Database Interfaces

This document describes the generic database interfaces located under
`src/core/database/interfaces`.

These interfaces provide a database agnostic abstraction that can be
implemented by different persistence layers (Supabase, Prisma, REST APIs, etc.).
They allow the service layer to operate independently of any particular
storage technology.

## Overview

- **`BaseDatabaseInterface`** – CRUD operations, connection management and
  optional query/transaction support.
- **`QueryBuilder`** – Fluent query builder for filtering, sorting and
  pagination.
- **`TransactionInterface`** – Simple transaction lifecycle control.
- **Entity interfaces** – Aliases that extend existing data provider
  interfaces (`IUserRepository`, `ITeamDataProvider`, etc.).

### Usage Example

```ts
import { QueryBuilder } from '@/core/database/interfaces';

async function listUsers(builder: QueryBuilder<UserProfile>) {
  return builder
    .filter({ field: 'active', operator: '=', value: true })
    .sort({ field: 'createdAt', direction: 'desc' })
    .paginate({ page: 1, limit: 20 })
    .execute();
}
```

## Error Handling

All methods should resolve with a `DatabaseError` when validation or business
rules fail. Unexpected provider errors may cause promise rejections.

## Migration Notes

Adapters that previously depended directly on Supabase or Prisma should migrate
to these interfaces. Implement the appropriate interface and expose the
implementation through the existing factory functions in `src/lib/database`.
