# Adapter System

This directory contains the adapter system for the User Management Module. The adapter system provides a way to connect the core business logic with different data sources and external services.

## Overview

The adapter system is built around the following principles:

1. **Interface-based Design**: All adapters implement well-defined interfaces
2. **Dependency Injection**: Adapters are injected into services at runtime
3. **Registry Pattern**: Central registry for managing different adapter implementations
4. **Factory Pattern**: Factories create adapter instances based on configuration

## Directory Structure

```
adapters/
├── auth/                  # Authentication adapters
│   ├── interfaces.ts      # Auth adapter interfaces
│   └── supabase/          # Supabase auth implementation
├── user/                  # User data adapters
├── team/                  # Team data adapters
├── permission/            # Permission adapters
├── supabase/              # Supabase adapter implementations
│   └── factory.ts         # Supabase adapter factory
└── registry.ts            # Adapter registry system
```

## Adapter Registry

The adapter registry (`registry.ts`) provides a central place to register and retrieve adapter factories. It supports multiple adapter types (e.g., Supabase, GraphQL) and makes it easy to switch between them.

### Registering a New Adapter Type

1. Create a factory class that implements the `AdapterFactory` interface
2. Create a factory creator function
3. Register the factory with the `AdapterRegistry`

Example:

```typescript
// 1. Import the registry and interfaces
import { AdapterRegistry, AdapterFactory, AdapterFactoryOptions } from '../registry';

// 2. Create your adapter factory
class MyAdapterFactory implements AdapterFactory {
  private options: any;
  
  constructor(options: AdapterFactoryOptions) {
    this.options = options;
  }
  
  createAuthProvider() {
    // Return your auth provider implementation
    return new MyAuthProvider(this.options);
  }
  
  // Implement other required methods...
}

// 3. Create a factory creator function
export function createMyAdapterFactory(options: AdapterFactoryOptions): AdapterFactory {
  return new MyAdapterFactory(options);
}

// 4. Register the factory (usually in an index.ts file)
AdapterRegistry.registerFactory('my-adapter', createMyAdapterFactory);
```

## Using Adapters in Services

Services should accept adapters through their constructors:

```typescript
import { AuthDataProvider } from '../adapters/auth/interfaces';

export class AuthService {
  constructor(private authProvider: AuthDataProvider) {}
  
  async login(email: string, password: string) {
    return this.authProvider.signInWithPassword(email, password);
  }
  
  // Other methods...
}
```

## Configuration

Adapters are configured when initializing the application:

```typescript
import { initializeUserManagement } from '@/core/initialization/initialize-adapters';

// Initialize with Supabase adapter
const services = initializeUserManagement({
  type: 'supabase',
  options: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
});

// Or with a custom adapter
const services = initializeUserManagement({
  type: 'my-custom-adapter',
  options: {
    // Custom options for your adapter
  }
});
```

## Adding a New Adapter Type

1. Create a new directory for your adapter type (e.g., `graphql/`)
2. Implement the required adapter interfaces
3. Create a factory that implements `AdapterFactory`
4. Register your factory with the `AdapterRegistry`
5. Update documentation with usage examples

## Testing

Each adapter should have corresponding tests in its `__tests__` directory. Tests should verify that the adapter correctly implements the interface contract.

## Best Practices

1. **Keep Adapters Focused**: Each adapter should handle one specific concern
2. **Dependency Injection**: Always inject dependencies rather than importing them directly
3. **Error Handling**: Implement proper error handling and translation
4. **Documentation**: Document any adapter-specific configuration options
5. **Testing**: Include tests for all adapter methods

## Available Adapters

- **Supabase**: `type: 'supabase'`
  - Options:
    - `supabaseUrl`: Your Supabase project URL
    - `supabaseKey`: Your Supabase anon/public key

- **Custom**: Implement the `AdapterFactory` interface

## Database Providers

Database providers encapsulate the low-level database clients. Register provider
factories with `AdapterRegistry.registerDatabaseFactory` and optionally set a
default provider using `AdapterRegistry.setDefaultDatabaseProvider`.

```typescript
import { AdapterRegistry } from '@/adapters';
import { createSupabaseDatabaseProvider } from '@/adapters/database/factory';

AdapterRegistry.registerDatabaseFactory('supabase', createSupabaseDatabaseProvider);
AdapterRegistry.setDefaultDatabaseProvider('supabase');

const db = AdapterRegistry.getDefaultDatabaseProvider({
  provider: 'supabase',
  connectionString: 'https://project.supabase.co'
});
```

Call `setActiveDatabaseProvider` on the registry instance to switch providers at
runtime.
