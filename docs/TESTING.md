# TESTING.md

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
