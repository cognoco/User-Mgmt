# User Management Module: Architecture Guidelines

## Core Principles

This document provides clear, unambiguous guidelines for developing the User Management Module as a fully modular, pluggable component that can be integrated into any host application. These principles **MUST** be followed without exception.

### 1. Strict Separation of Concerns

#### 1.1 Business Logic vs. UI

- Business logic MUST reside ONLY in dedicated service or core classes/functions
- UI components MUST be limited to display, user interaction, and calling service methods
- Data transformation, validation, and processing MUST happen in services, not UI components


**📁 IMPORT PATH RULES:**
- - Use `@/` for any file or module inside the `src/` directory.
- Use `@app/` for any file or module inside the `app/` directory.

**❌ FORBIDDEN:**
- UI components MUST NOT contain API calls
- UI components MUST NOT implement validation logic
- UI components MUST NOT directly manipulate data stores or state



#### 1.2 Layered Architecture

Every feature MUST adhere to this strict layering:

1. **Core Layer:** Domain interfaces, entities, and business rules
2. **Adapter Layer:** Implementation of interfaces for external services
3. **Service Layer:** Implementation of core business logic
4. **Hook Layer:** React hooks that connect UI to services
5. **UI Layer:** Headless components (behavior) and styled components (appearance)

### 2. Interface-First Design

#### 2.1 Core Domain Model

**✅ REQUIRED:**
- Every domain concept MUST have a clearly defined TypeScript interface
- All services MUST be defined as interfaces first, implementations second
- All service implementations MUST fully implement their interfaces

**❌ FORBIDDEN:**
- No hard dependencies on implementation details
- No accessing implementation-specific properties that aren't in the interface

#### 2.2 External Dependencies

**✅ REQUIRED:**
- All database/API access MUST happen through adapter interfaces 
- All adapters MUST be replaceable via configuration
- Default implementations MUST be provided for all adapters

### 3. Component Architecture

#### 3.1 Headless UI Pattern

**✅ REQUIRED:**
- UI components MUST follow the headless pattern
- Every UI component MUST have:
  1. A headless version that handles behavior only
  2. A styled version that provides default appearance

**Example:**
```typescript
// Headless component
export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error?: string;
  render: (props: {
    handleSubmit: (e: React.FormEvent) => void;
    emailValue: string;
    setEmailValue: (value: string) => void;
    passwordValue: string;
    setPasswordValue: (value: string) => void;
    isSubmitting: boolean;
    error?: string;
  }) => React.ReactNode;
}
```

#### 3.2 Render Props and Component Composition

**✅ REQUIRED:**
- Headless components MUST use render props or children functions
- Components MUST accept custom rendering logic from host applications
- Components MUST be composable and nestable

**❌ FORBIDDEN:**
- Components MUST NOT have hard dependencies on specific UI libraries
- Components MUST NOT assume specific styling approaches
- CSS/styling MUST be contained and overridable

### 4. Configuration System

#### 4.1 Service Configuration

**✅ REQUIRED:**
- The module MUST provide a global configuration system
- Host applications MUST be able to override any service implementation
- Default implementations MUST be provided for all services

**Example:**
```typescript
interface UserManagementConfig {
  authService?: AuthService;
  userService?: UserService;
  // ...other services
}

function configureUserManagement(config: Partial<UserManagementConfig>) {
  // Implementation...
}
```

#### 4.2 Feature Flags

**✅ REQUIRED:**
- Every distinct feature MUST be toggleable via feature flags
- Features MUST operate correctly when enabled/disabled independently
- UI MUST adapt appropriately to disabled features

### 5. State Management

#### 5.1 Encapsulated State

**✅ REQUIRED:**
- State MUST be encapsulated within services or hooks
- State access MUST be through defined interfaces
- Global state MUST be injectable and replaceable

**❌ FORBIDDEN:**
- No direct access to state stores from components
- No assumptions about specific state management libraries

### 6. Integration Points

#### 6.1 Host Application Integration

**✅ REQUIRED:**
- The module MUST provide clear integration points
- All HTML/CSS generation MUST be replaceable
- The module MUST be usable with different bundling/build systems

**❌ FORBIDDEN:**
- No assumptions about host application structure
- No modification of global state/DOM outside of designated containers

### 7. Testing Considerations

**✅ REQUIRED:**
- All components MUST be testable in isolation
- All interfaces MUST have mock implementations for testing
- Services MUST be testable with dependency injection

## Practical Implementation Guide

### Directory Structure

```
/src
├── core/              # Core business logic & interfaces
│   ├── auth/          # Authentication domain
│   │   ├── interfaces.ts  # AuthService interface
│   │   ├── models.ts      # Auth entities (User, Session, etc.)
│   │   └── events.ts      # Auth events
│   └── ...
├── adapters/          # External dependency adapters
│   ├── auth/
│   │   ├── interfaces.ts  # AuthDataProvider interface
│   │   └── supabase/      # Supabase adapter implementation
│   └── ...
├── services/          # Service implementations
│   ├── auth/
│   │   └── default-auth.service.ts  # DefaultAuthService
│   └── ...
├── hooks/             # React hooks
│   # Hook filenames must use camelCase (e.g., useAuth.ts)
│   ├── auth/
│   │   └── useAuth.ts  # Auth hooks
│   └── ...
└── ui/                # UI components
    ├── headless/      # Behavior-only components
    │   ├── auth/
    │   │   └── LoginForm.tsx  # Headless login form
    │   └── ...
    └── styled/        # Default styled implementations
        ├── auth/
        │   └── LoginForm.tsx  # Styled login form
        └── ...
```

### Example Pattern

**Core Interface:**
```typescript
// src/core/auth/interfaces.ts
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(userData: RegistrationData): Promise<AuthResult>;
  logout(): Promise<void>;
}
```

**Adapter Interface:**
```typescript
// src/adapters/auth/interfaces.ts
export interface AuthDataProvider {
  authenticateUser(credentials: LoginCredentials): Promise<UserData>;
  createUser(userData: RegistrationData): Promise<UserData>;
}
```

**Service Implementation:**
```typescript
// src/services/auth/default-auth.service.ts
export class DefaultAuthService implements AuthService {
  constructor(private dataProvider: AuthDataProvider) {}
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Implementation using dataProvider
  }
}
```

**Hook Implementation:**
```typescript
// src/hooks/auth/useAuth.ts
export function useAuth() {
  const authService = useAuthService();
  // Implementation that uses authService
  
  return {
    login,
    logout,
    // ...other functions and state
  };
}
```

**Headless Component:**
```typescript
// src/ui/headless/auth/LoginForm.tsx
export function LoginForm({
  onSubmit,
  isLoading,
  error,
  render
}: LoginFormProps) {
  // Implementation
  
  return render({
    handleSubmit,
    emailValue,
    // ...other props
  });
}
```

**Styled Component:**
```typescript
// src/ui/styled/auth/LoginForm.tsx
import { LoginForm as HeadlessLoginForm } from '../../headless/auth/LoginForm';

export function LoginForm(props) {
  return (
    <HeadlessLoginForm
      {...props}
      render={({
        handleSubmit,
        // ...other props
      }) => (
        <form onSubmit={handleSubmit}>
          {/* Default rendering */}
        </form>
      )}
    />
  );
}
```

## Testing Architecture

### 1. Layer-Specific Testing Approach

**✅ REQUIRED:**
- Tests MUST be organized according to the same layered architecture as the code
- Each layer MUST be tested in isolation from other layers
- Tests MUST use mock implementations of dependencies from lower layers
- Test files MUST use consistent naming conventions with `.test.ts` or `.test.tsx` extension

**❌ FORBIDDEN:**
- Tests MUST NOT have direct dependencies on implementation details of other layers
- Tests MUST NOT use local mocks; all mocks MUST be defined in global mock files
- Test must have generic import paths where possibl so that it is possible to move them without import path changes

### 2. Test Directory Structure

**✅ REQUIRED:**
- Tests MUST be placed in `__tests__` directories adjacent to the code they test
- Mock implementations MUST be placed in `/src/tests/mocks` with clear naming conventions
- Test utilities MUST be placed in `/src/tests/utils`
- Use mocks minimally, use the real implementation to find missing elements and bugs! 

**Example:**
```
/src/core/auth/__tests__/                # Core layer tests
/src/adapters/supabase/__tests__/        # Adapter layer tests
/src/services/auth/__tests__/            # Service layer tests
/src/hooks/auth/__tests__/               # Hook layer tests
/src/ui/headless/auth/__tests__/         # UI layer tests (headless)
/src/ui/styled/auth/__tests__/           # UI layer tests (styled)
/src/tests/mocks/auth-service.mock.ts    # Mock AuthService implementation
/src/tests/utils/render-with-providers.tsx # Test utility
```

### 3. Testing Patterns by Layer

**Core Layer Tests:**
- Test interfaces for correctness
- Test models/entities for business rule validation
- Test events for proper structure

**Adapter Layer Tests:**
- Mock external dependencies (database, API)
- Test adapter implementation against its interface
- Test error handling and edge cases

**Service Layer Tests:**
- Mock adapter dependencies
- Test business logic implementation
- Test service factory functions

**Hook Layer Tests:**
- Mock service dependencies
- Test state management
- Test side effects

**UI Layer Tests:**
- Mock hook dependencies
- Test rendering logic
- Test user interactions
- Test prop handling

## Compliance Checklist

Before committing any code, ask yourself:

1. Does my component contain business logic? (It shouldn't)
2. Does my service have UI elements? (It shouldn't)
3. Is my component replaceable by a host application?
4. Does my feature work if a host application replaces my UI?
5. Can my component receive custom rendering logic?
6. Are all dependencies injectable and replaceable?
7. Does my code assume specific implementation details?
8. Is my code testable in isolation?
9. Do my tests follow the layered architecture?
10. Are my tests using the correct naming conventions?
11. Are my tests using global mocks instead of local mocks?

Following these guidelines ensures the User Management Module remains truly modular, pluggable, and easy to integrate into any host application.

## Path Aliases: @ and @app

To keep imports clean and maintainable, this project uses TypeScript path aliases configured in `tsconfig.json`:

```json
"paths": {
  "@/*": ["./src/*"],
  "@app/*": ["./app/*"]
}
```

### How to Use

- Use `@/` for any file or module inside the `src/` directory.
- Use `@app/` for any file or module inside the `app/` directory.

#### Examples

**Importing from `src/`**
```typescript
// ✅ DO:
import { MyComponent } from '@/ui/styled/profile/MyComponent';

// ❌ DON'T:
import { MyComponent } from '@/src/ui/styled/profile/MyComponent'; // (Redundant 'src')
import { MyComponent } from '@app/ui/styled/profile/MyComponent'; // (Wrong alias)
```

**Importing from `app/`**
```typescript
// ✅ DO:
import AccessRulesClientPage from '@app/admin/access-rules/ClientPage';

// ❌ DON'T:
import AccessRulesClientPage from '@/app/admin/access-rules/ClientPage'; // (Wrong alias)
import AccessRulesClientPage from '@/src/app/admin/access-rules/ClientPage'; // (Wrong alias)
```

### Summary Table
| Folder         | Correct Alias | Example Import Path                                 |
|----------------|--------------|-----------------------------------------------------|
| `src/`         | `@/`         | `@/ui/styled/profile/Profile`                        |
| `app/`         | `@app/`      | `@app/admin/access-rules/ClientPage`                |

### Best Practices
- Never use `@/src/` or `@/app/` in import paths.
- Never use relative imports (like `../../`) for modules that can be referenced via an alias.
- Keep alias usage consistent across the codebase.
