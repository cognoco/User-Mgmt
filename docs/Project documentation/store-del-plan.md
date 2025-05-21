# Migration Plan: Auth Store to Auth Service

This document outlines the plan to migrate from the current Zustand-based auth store to the new architecture-compliant auth service implementation. This migration follows the layered architecture guidelines where UI components should connect to services through hooks.

## 1. Overview

- [ ] Create a new auth hook layer that connects UI components to the auth service
- [ ] Update components to use the hook instead of the store
- [ ] Gradually deprecate and eventually remove the store layer

## 2. Detailed Steps

### Phase 1: Create Auth Hook Layer

- [ ] Create the auth hook directory structure
  - [ ] `src/hooks/auth/`
  - [ ] `src/hooks/auth/__tests__/`

- [ ] Implement the `use-auth.ts` hook
  - [ ] Create hook that provides the same interface as the current auth store
  - [ ] Connect to the DefaultAuthService implementation
  - [ ] Include all functionality from the auth store (login, logout, register, etc.)
  - [ ] Ensure proper TypeScript types for type checking

- [ ] Create hook tests
  - [ ] Implement unit tests for the hook
  - [ ] Test all functionality that components will rely on
  - [ ] Ensure tests pass with the new implementation

### Phase 2: Update Components

- [ ] Create/enhance migration script
  - [ ] Update the existing `migrate-auth-imports.cjs` script
  - [ ] Handle all edge cases (different import patterns, usage patterns)
  - [ ] Update import statements from `@/lib/stores/auth.store` to `@/hooks/auth/use-auth`
  - [ ] Update usage patterns from `useAuthStore(state => state.X)` to `useAuth().X`

- [ ] Update UI components in phases
  - [ ] Simple components
    - [ ] Header
    - [ ] ProfileForm
    - [ ] SessionTimeout
    - [ ] AccountDeletion
  - [ ] Auth components
    - [ ] LoginForm
    - [ ] RegistrationForm
    - [ ] EmailVerification
    - [ ] PasswordReset
  - [ ] MFA components
    - [ ] MFASetup
    - [ ] MFAVerification
  - [ ] Settings components
    - [ ] PasswordChange
    - [ ] AccountSettings

- [ ] Update tests alongside components
  - [ ] Update test imports
  - [ ] Update test mocks
  - [ ] Ensure all tests pass with the new implementation

### Phase 3: Deprecate and Remove Auth Store

- [ ] Mark auth store as deprecated
  - [ ] Add JSDoc deprecation comments
  - [ ] Add console warnings in development mode
  - [ ] Document migration path in README

- [ ] Create transition period
  - [ ] Allow both approaches to work simultaneously
  - [ ] Add monitoring/logging for components still using the old store
  - [ ] Create report of remaining usages

- [ ] Remove the auth store
  - [ ] Remove store implementation once all components are migrated
  - [ ] Update any remaining tests that mock the auth store
  - [ ] Clean up any unused dependencies

## 3. Implementation Details

### Auth Hook Implementation (`src/hooks/auth/use-auth.ts`)

The hook will:
- [ ] Use React context to provide the auth service instance
- [ ] Return all methods and state from the auth service
- [ ] Match the interface that components currently expect from the auth store
- [ ] Include TypeScript types for proper type checking

### Component Migration Pattern

For each component:

1. Update imports:
```typescript
// Before
import { useAuthStore } from '@/lib/stores/auth.store';

// After
import { useAuth } from '@/hooks/auth/use-auth';
```

2. Update usage:
```typescript
// Before
const user = useAuthStore(state => state.user);
const logout = useAuthStore(state => state.logout);

// After
const { user, logout } = useAuth();
```

3. Update tests:
```typescript
// Before
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: () => mockAuthStore
}));

// After
vi.mock('@/hooks/auth/use-auth', () => ({
  useAuth: () => mockAuthService
}));
```

## 4. Timeline and Milestones

- [ ] Week 1: Setup and Preparation
  - [ ] Create hook structure
  - [ ] Implement basic hook functionality
  - [ ] Write tests for the hook

- [ ] Week 2-3: Component Migration
  - [ ] Update simple components
  - [ ] Update complex components
  - [ ] Update tests

- [ ] Week 4: Finalization
  - [ ] Deprecate auth store
  - [ ] Final testing
  - [ ] Documentation updates

## 5. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes in component behavior | Comprehensive testing after each update |
| Missing functionality in the auth service | Ensure all auth store functions have equivalents in the service |
| Performance issues | Monitor performance before and after migration |
| Test failures | Update tests alongside components |

## 6. Progress Tracking

- [ ] Phase 1 completed: Auth hook layer created
- [ ] Phase 2 completed: Components updated
- [ ] Phase 3 completed: Auth store removed

## 7. Notes and Observations

*Add notes here as you progress through the migration*