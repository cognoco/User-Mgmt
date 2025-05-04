# TESTING.md

## Recent Test Infrastructure Updates (May 2025)

- **TypeScript Configuration:**
  - Enabled `jsx: react-jsx` for modern React JSX transform.
  - Added `allowSyntheticDefaultImports: true` and ensured `esModuleInterop: true` for compatibility with default imports (e.g., React).
  - Confirmed and documented path alias support: `@/*` now maps to `src/*` via `tsconfig.json`.
- **Vite/Vitest Configuration:**
  - Installed and enabled `vite-tsconfig-paths` plugin in `vitest.config.ts` to ensure path aliases work in both app and test environments.
  - Removed manual alias config in favor of plugin-based resolution.
- **Jest-DOM Matchers:**
  - Confirmed global setup of `@testing-library/jest-dom` matchers in `vitest.setup.ts` for all tests.
# TESTING.md

## Recent Test Infrastructure Updates (June 2024)

- **TypeScript Configuration:**
  - Enabled `jsx: react-jsx` for modern React JSX transform.
  - Added `allowSyntheticDefaultImports: true` and ensured `esModuleInterop: true` for compatibility with default imports (e.g., React).
  - Confirmed and documented path alias support: `@/*` now maps to `src/*` via `tsconfig.json`.
- **Vite/Vitest Configuration:**
  - Installed and enabled `vite-tsconfig-paths` plugin in `vitest.config.ts` to ensure path aliases work in both app and test environments.
  - Removed manual alias config in favor of plugin-based resolution.
- **Jest-DOM Matchers:**
  - Confirmed global setup of `@testing-library/jest-dom` matchers in `vitest.setup.ts` for all tests.
  - No further action needed; all tests can use matchers like `toBeInTheDocument()`.

## General Test Best Practices

1. **Isolate Tests with Local Mocks**
   - Use local mock components or stores within each test (or test suite) rather than relying on global mocks or patching deep internals.
   - Prevents test pollution, ensures each test is fully in control of its dependencies, and avoids issues with module caching or import order.
   - Define mock components/functions inside the test file and only mock what you need for the specific test.

2. **Reset Modules and Mocks Before Each Test**
   - Always call `vi.resetModules()` and `vi.clearAllMocks()` in a `beforeEach` block.
   - Ensures a clean slate for every test, preventing state leakage and unexpected behavior.
   - Example:
     ```ts
     beforeEach(() => {
       vi.resetModules();
       vi.clearAllMocks();
     });
     ```

3. **Avoid Importing Modules Before Mocks Are Set**
   - Set up all mocks before importing the module under test.
   - Ensures that the module uses the mocked dependencies, not the real ones.
   - Use dynamic `await import()` after mocks are set up. Never import the component at the top of the file if you need to mock its dependencies.

4. **Use User-Centric Testing Patterns**
   - Interact with the UI as a user would (using `@testing-library/user-event`), and assert on visible output, not internal state.
   - Tests are more resilient to refactoring and better reflect real user experience.
   - Use `screen.getByRole`, `screen.getByLabelText`, etc. Avoid querying by implementation details (e.g., class names, test IDs unless necessary).

---

## Zod Schema & Form Field Alignment Issue (Case Study)

**Problem:**
- If a Zod schema used for form validation includes a required field (e.g., `email`) that is not actually rendered in the form, form validation will always fail, and the submit handler will never be called.
- This can cause tests to fail with errors like: `expected mock to be called, but it was never called`.

**Example:**
- In the `ProfileEditor` component, the Zod schema required an `email` field, but the form did not render an email input. As a result, the form could never be submitted, and the test for profile update always failed.

**Solution:**
- Always ensure that the Zod schema matches the fields actually rendered in the form. Remove any required fields from the schema that are not present in the UI, or make them optional if they are conditionally rendered.
- After aligning the schema and the form, the test and the user flow will work as expected.

---

## Backup Codes Integration & E2E Tests

### Integration Test: `src/tests/integration/backup.integration.test.tsx`
- **Covers:**
  - Display, download, copy, and regenerate backup codes in user settings
  - Verifying a valid backup code in the MFA verification form
  - Error handling for invalid backup codes
- **Tools:** React Testing Library, MSW, React Query

### E2E Test: `e2e/backup-codes.e2e.test.ts`
- **Covers:**
  - User can generate, download, and regenerate backup codes in settings
  - User can use a backup code to log in when 2FA is required
  - Error handling for invalid backup codes during login
- **Tools:** Playwright

### Notes
- Tests simulate real user actions for backup code management and recovery flows.
- Integration and E2E tests ensure both UI and backend endpoints work as intended.
- If backup code flows are extended (e.g., admin/manual recovery), tests should be updated accordingly.

---

## For Test Coverage Gaps and Current Status

- For the canonical list of missing tests and coverage gaps, see [`docs/GAP_ANALYSIS.md`](./GAP_ANALYSIS.md).
- For the latest test run results and actionable findings, see [`docs/Testing_Findings.md`](./Testing_Findings.md).
- For ongoing and known issues, see [`docs/TESTING_ISSUES.md`](./TESTING_ISSUES.md).

## (2024-06-24) Supabase Builder Chain Mocking Pattern

- **Pattern:** When mocking Supabase's `.from(...).update(...).eq(...)` chain, always return a builder object at each step, not a promise. This prevents `eq is not a function` errors in tests.
- **Example:**
  ```js
  update: vi.fn().mockImplementation((updates) => ({
    eq: vi.fn().mockImplementation(() => Promise.resolve({ data: updatedProfile, error: null }))
  }))
  ```
- **Why:** The real Supabase client returns a builder at each step, so tests must mirror this for correct behavior.
- **Reference:** See `TESTING_ISSUES.md` and `Testing_Findings.md` for more details and examples.

## (2024-06-24) React act(...) Warnings

- **Pattern:** Always wrap user events and async state updates in `await act(async () => { ... })` or `await waitFor(...)` to avoid act warnings and ensure reliable test results.
- **Reference:** See `TESTING_ISSUES.md` and `Testing_Findings.md` for more details and examples.

## Supabase Files: Purpose and Usage Guide

This project contains several files related to Supabase. Each serves a distinct purpose. Use this guide to select the correct file for your use case and avoid duplication or confusion.

### 1. `src/lib/database/supabase.ts` & `src/lib/database/supabase.js`
- **Purpose:**
  - These files provide the main Supabase client instance for the application, using environment variables for configuration.
  - They export both a standard client (`supabase`) for client-side use and a `getServiceSupabase()` function for server-side/admin operations (using the service role key).
- **When to use:**
  - Use these for most direct database interactions in the app, especially in backend logic, API routes, or when you need to distinguish between client and service role access.
- **Note:**
  - The `.ts` version is preferred for TypeScript projects. The `.js` version may be legacy or for compatibility.

### 2. `src/lib/supabase.ts`
- **Purpose:**
  - A minimal Supabase client export, using only the public URL and anon key.
- **When to use:**
  - Use this for simple, client-side only operations where you do not need service role/admin access or extra configuration.
- **Note:**
  - Does not provide a `getServiceSupabase()` function.

### 3. `src/lib/database/providers/supabase.ts`
- **Purpose:**
  - Implements a `SupabaseProvider` class that abstracts all user, profile, preferences, and activity log operations behind a common interface (`DatabaseProvider`).
  - Designed for plug-and-play database backends (e.g., swapping Supabase for another provider).
- **When to use:**
  - Use this when you want to interact with the database in a provider-agnostic way, or when building features that should work with multiple database backends.
- **Note:**
  - This is the most flexible and future-proof approach for database operations.

### 4. `src/tests/mocks/supabase.ts` (and `.bak`)
- **Purpose:**
  - Provides a comprehensive mock of the Supabase client for use in tests.
  - Mocks all major methods (auth, storage, from, etc.) and supports chaining and spying with Vitest.
- **When to use:**
  - Import this mock in your test files when you need to simulate Supabase behavior without hitting the real backend.
- **Note:**
  - The `.bak` file is a backup/older version. Use `supabase.ts` for current tests.

### 5. `src/lib/database/__tests__/supabase.test.tsx`
- **Purpose:**
  - Contains tests for the Supabase client setup itself, ensuring correct instantiation and error handling.
- **When to use:**
  - Reference for how to test Supabase client instantiation and environment variable handling.

---

**Best Practices:**
- For application code, prefer the provider class (`SupabaseProvider`) for maximum flexibility.
- For direct, simple access, use `src/lib/database/supabase.ts` (TypeScript) or `.js` (JavaScript).
- For tests, always use the mock in `src/tests/mocks/supabase.ts`.
- Avoid duplicating Supabase client logic; always check this guide before creating new files or mocks.

### Middleware & Global Mocking Patterns

#### Robust Global Mocking for Middleware Tests (2024-06)

- When testing middleware that relies on a global singleton or a new instance per request (e.g., Upstash Redis, database clients), always ensure your mock implementation is dynamically updatable per test.
- **Pattern:** Use a global variable (e.g., `globalThis.__multiExecMockImpl`) to control the return value of the core mock (such as `multi.exec`). In your test setup, always have the mock call the current value of this global function, and set it explicitly in each test.
- **Why:** This allows each test to simulate different backend responses (e.g., "under limit" vs. "over limit") without test pollution or race conditions, and ensures the middleware always uses the correct mock for the current test.
- **Example:**
  ```ts
  // In your vi.mock setup:
  multiMock.exec.mockImplementation((...args) => {
    return typeof globalThis.__multiExecMockImpl === 'function'
      ? globalThis.__multiExecMockImpl(...args)
      : Promise.resolve(defaultResponses);
  });
  // In each test:
  globalThis.__multiExecMockImpl = async () => [ /* custom responses */ ];
  ```
- **Result:** This pattern ensures robust, isolated, and flexible middleware tests, especially for rate limiting, authentication, and other request-based logic.

---

If you move the files into the correct directory or resolve the permissions, I can add this content for you automatically. Would you like instructions on how to move the files, or do you want to try again?
