# User Management Module: Codebase Organization Guidelines

This document establishes standards for organizing code in the User Management Module. Following these guidelines will maintain consistency and prevent the previous issues of duplication and complex nesting.

## Directory Structure Overview

```
/
├── e2e/                  # End-to-End (Playwright) tests
├── app/                  # Next.js App Router pages and API routes
├── src/                  # Core source code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries and utilities
│   ├── middleware/       # Next.js middleware
│   ├── types/            # TypeScript type definitions
│   └── tests/            # Generic test utilities, mocks, and non-Playwright integration tests
├── public/               # Static assets
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Core Principles

1. **Single Source of Truth**: Each piece of functionality should exist in exactly one location.
2. **Feature-Based Organization**: Group code by feature/domain rather than technical role.
3. **Colocation of Tests**: Unit/Component/API tests should live close to the code they test (`__tests__`). E2E tests reside in the root `/e2e` folder.
4. **Clear Dependencies**: Higher-level components depend on lower-level ones, not vice versa.
5. **App Router Standard**: Follow Next.js App Router conventions for pages and API routes.

## Detailed Guidelines

### End-to-End Tests (`/e2e`)

- **Location**: All End-to-End (E2E) tests using Playwright reside in the root `/e2e` directory.
- **Test Files**: Test specification files (`*.spec.ts` or `*.test.ts`) should be organized by feature or user flow.
  ```
  /e2e/auth/registration.spec.ts
  /e2e/profile/update-profile.spec.ts
  /e2e/admin/role-management.spec.ts
  ```
- **Utilities**: Helper functions, page object models, custom commands, or setup scripts **specific to Playwright tests** should live in `/e2e/utils/`.
  ```
  /e2e/utils/auth.ts
  /e2e/utils/form-helpers.ts
  ```
- **Fixtures/Data**: Test data or fixtures used exclusively by E2E tests can be placed in `/e2e/fixtures/`.

### App Router (`/app`)

- **Pages**: Each page should be in a dedicated directory with a `page.tsx` file.
  ```
  /app/login/page.tsx
  /app/settings/page.tsx
  /app/organizations/[orgId]/settings/page.tsx
  ```

- **API Routes**: Each API endpoint should be in a dedicated directory with a `route.ts` file.
  ```
  /app/api/auth/login/route.ts
  /app/api/team/members/route.ts
  /app/api/team/members/[memberId]/route.ts
  ```

- **API Tests**: API tests should be in a `__tests__` directory within the endpoint directory.
  ```
  /app/api/auth/login/__tests__/route.test.ts
  ```

- **Layouts**: Shared layouts should use the App Router layout pattern.
  ```
  /app/layout.tsx
  /app/settings/layout.tsx
  ```

### Components (`/src/components`)

- **Feature-Based Organization**: Group components by feature or domain.
  ```
  /src/components/auth/LoginForm.tsx
  /src/components/profile/ProfileEditor.tsx
  /src/components/team/TeamMembersList.tsx
  ```

- **Component Tests**: Tests should be in a `__tests__` directory within the feature directory.
  ```
  /src/components/auth/__tests__/LoginForm.test.tsx
  ```

- **Component Mocks**: Mocks should be in a `__mocks__` directory within the feature directory.
  ```
  /src/components/auth/__mocks__/LoginForm.tsx
  ```

- **UI Components**: Generic UI components should be in `/src/components/ui`.
  ```
  /src/components/ui/button.tsx
  /src/components/ui/dialog.tsx
  ```

- **Common Components**: Reusable components that don't fit into a specific feature should be in `/src/components/common`.
  ```
  /src/components/common/DataTable.tsx
  /src/components/common/ThemeSwitcher.tsx
  ```

- **Global Providers & Contexts**: Global providers and context components (such as ThemeProvider, AuthProvider, etc.) manage application-wide state or configuration and are intended to wrap the entire app or major sections.
  - If a provider is used throughout the entire application, it may be placed directly in `/src/components/` for easy access and visibility.
  - For better organization, you may optionally place global providers in a dedicated subfolder (e.g., `/src/components/theme/ThemeProvider.tsx` or `/src/components/auth/AuthProvider.tsx`).
  - If a provider is feature-specific, colocate it within the relevant feature directory.
  - **Examples**:
    ```
    /src/components/theme-provider.tsx           # Global theme provider (top-level)
    /src/components/theme/ThemeProvider.tsx      # (Optional) Organized in a theme subfolder
    /src/components/auth/AuthProvider.tsx        # Auth context provider
    ```
  - **Guideline**: Choose the location that best matches the provider's scope and usage. Top-level is preferred for truly global providers; use subfolders for clarity if you have multiple providers or want stricter organization.

### Hooks (`/src/hooks`)

- **Feature-Specific Hooks**: Hooks specific to a feature should be in the hooks directory.
  ```
  /src/hooks/useAuth.ts
  /src/hooks/useTeamMembers.ts
  ```

- **Hook Tests**: Tests should be in a `__tests__` directory.
  ```
  /src/hooks/__tests__/useAuth.test.ts
  ```

### Library Code (`/src/lib`)

- **Feature-Based Organization**: Group library code by feature or domain.
  ```
  /src/lib/auth/index.ts
  /src/lib/database/supabase.ts
  ```

- **Database Providers**: Database providers should be in `/src/lib/database/providers`.
  ```
  /src/lib/database/providers/supabase.ts
  /src/lib/database/providers/prisma.ts
  ```

- **Stores**: State management stores should be in `/src/lib/stores`.
  ```
  /src/lib/stores/auth.store.ts
  /src/lib/stores/profile.store.ts
  ```

- **Utils**: Utility functions should be in `/src/lib/utils`.
  ```
  /src/lib/utils/token.ts
  /src/lib/utils/security.ts
  ```

- **Library Tests**: Tests should be in a `__tests__` directory within the feature directory.
  ```
  /src/lib/auth/__tests__/session.test.ts
  /src/lib/stores/__tests__/auth.store.test.ts
  ```

### Types (`/src/types`)

- **Type Definitions**: TypeScript type definitions should be in `/src/types`.
  ```
  /src/types/auth.ts
  /src/types/user.ts
  ```

- **API Types**: Types related to API responses/requests can be organized by feature.
  ```
  /src/types/api/auth.ts
  /src/types/api/team.ts
  ```

### Middleware (`/src/middleware`)

- **Middleware Files**: Middleware should be in `/src/middleware`.
  ```
  /src/middleware/auth.ts
  /src/middleware/permissions.ts
  ```

- **Middleware Tests**: Tests should be in a `__tests__` directory.
  ```
  /src/middleware/__tests__/auth.test.ts
  ```

### Shared Test Assets (`/src/tests`)

This directory holds testing assets that are **not specific to Playwright E2E tests** and may be shared across different types of tests (Unit, Component, Integration).

- **Generic Test Utilities (`/src/tests/utils`)**: Contains reusable helper functions, custom render functions (e.g., for React Testing Library), environment setup, or utilities applicable to Vitest/RTL tests. These can potentially be imported by E2E tests if truly generic.
  ```
  /src/tests/utils/test-utils.tsx           # Custom RTL render
  /src/tests/utils/store-testing-utils.ts   # Helpers for Zustand stores
  /src/tests/utils/environment-setup.ts     # JSDOM or other setup
  ```

- **Generic Test Mocks (`/src/tests/mocks`)**: Contains global mocks, such as MSW handlers for API mocking, or mock implementations for external libraries used across different test types.
  ```
  /src/tests/mocks/handlers.ts              # MSW request handlers
  /src/tests/mocks/supabase.js              # Mock Supabase client
  ```

- **Non-Playwright Integration Tests (`/src/tests/integration`)**: Contains integration tests focusing on the interaction between multiple components, hooks, or services *without* using a full browser environment like Playwright. Typically uses Vitest, RTL, and potentially mocked APIs (via MSW).
  ```
  /src/tests/integration/profile-update-flow.test.tsx # Testing form -> store -> mock API
  ```

## Import Path Guidelines

1. **Absolute Imports**: Use absolute imports for project modules to avoid "../../../" paths.
   ```typescript
   // Good
   import { Button } from "@/components/ui/button";
   import { useAuth } from "@/hooks/useAuth";
   
   // Avoid
   import { Button } from "../../../components/ui/button";
   ```

2. **Index Files**: Use index files to simplify imports for complex features.
   ```typescript
   // src/lib/auth/index.ts exports multiple auth-related functions
   import { signIn, signOut, getSession } from "@/lib/auth";
   ```

3. **Type Imports**: Use type imports for TypeScript types to avoid importing implementation code.
   ```typescript
   import type { User, Session } from "@/types/auth";
   ```

## Adding New Features

When adding new features, follow these steps:

1. **Identify the Feature Domain**: Determine which existing feature domain the new code belongs to (auth, profile, team, etc.).

2. **Create Appropriate Directories**: If this is a new feature domain, create the necessary directories.

3. **Follow the Structure**:
   - Place API routes in `/app/api/{feature}/route.ts`
   - Place pages in `/app/{route}/page.tsx`
   - Place components in `/src/components/{feature}/`
   - Place hooks in `/src/hooks/`
   - Place types in `/src/types/`

4. **Add Tests**: Always add tests for new functionality following the testing structure.

5. **Update Documentation**: Add or update documentation in `/docs` as needed.

## Examples of Common Scenarios

### Adding a New Authentication Method

```
/app/api/auth/saml/route.ts                      # API route for SAML
/app/api/auth/saml/__tests__/route.test.ts       # Tests for SAML API
/src/components/auth/SAMLSetup.tsx               # SAML setup component
/src/components/auth/__tests__/SAMLSetup.test.tsx # Tests for SAML component
/src/hooks/useSAMLAuth.ts                        # Hook for SAML auth
/src/lib/auth/saml.ts                            # SAML auth utilities
/src/types/saml.ts                               # SAML-related types
```

### Adding a New Team Feature

```
/app/api/team/roles/route.ts                     # API route for team roles
/app/api/team/roles/__tests__/route.test.ts      # Tests for team roles API
/src/components/team/RoleManagement.tsx          # Role management component
/src/components/team/__tests__/RoleManagement.test.tsx # Tests for role component
/src/hooks/useTeamRoles.ts                       # Hook for team roles
/src/types/team-roles.ts                         # Team roles types
```

## Resolving Common Questions

### "Where should I put this new component?"

Ask yourself:
1. Is it part of an existing feature? → Put it in that feature's directory
2. Is it a generic UI component? → Put it in `/src/components/ui/`
3. Is it reusable across features? → Put it in `/src/components/common/`
4. Is it a new feature? → Create a new feature directory

### "Where should I put this new utility function?"

Ask yourself:
1. Is it specific to a feature? → Put it in `/src/lib/{feature}/`
2. Is it a general utility? → Put it in `/src/lib/utils/`

### "How should I name my files?"

1. Use kebab-case for file names: `team-member-list.tsx`
2. For components, use PascalCase export names: `export function TeamMemberList()`
3. For hooks, use camelCase with "use" prefix: `export function useTeamMembers()`
4. For utilities, use camelCase: `export function formatDate()`

## Maintenance and Enforcement

1. Use ESLint rules to enforce import paths and structure.
2. Regular codebase audits to ensure compliance.
3. Code review checklist should include organization standards.
4. Update this guide as needed when new patterns emerge.

By following these guidelines, we'll maintain a clean, well-organized codebase that is easy to navigate and extend.
