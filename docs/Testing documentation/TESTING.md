# Testing Guidelines

## Core Testing Principles & Approach

### A. Production-First, Test-Second Approach
- The project now follows a production-first, test-second approach for new features.
- Test skeletons are only created in advance if a feature is high-risk or likely to cause regressions.
- This ensures that tests are always written against the real, user-facing implementation.

### B. Documenting New Issues (in TESTING_ISSUES.md)
- For ongoing issues, specific solutions, and advanced patterns learned from troubleshooting, refer to `TESTING_ISSUES.md`.
- Update `TESTING_ISSUES.md` as new specific issues or complex solutions are discovered during post-implementation testing.

## Philosophy & Best Practices
- Focus on user-centric, integration, and E2E tests that reflect real user flows.
- Avoid over-mocking; prefer real implementations unless isolation is required.
- Use robust selectors (getByRole, getByLabelText) and avoid implementation details.
- Align Zod schemas with rendered form fields to prevent validation/test failures.

## Stack & Tooling
- **Unit/Integration:** Vitest, React Testing Library, User Event, MSW, JSDOM, Jest-DOM.
- **E2E:** Playwright (with data-testid selectors, robust locators, and API mocking via page.route).
- **i18n:** i18next with English as the default for tests; see i18nTestSetup for details.
- **Centralized Mocks:** All major stores (Zustand), Supabase, Axios, and API endpoints are mocked globally in `src/tests/mocks/`.

## Test Environment Setup
- **Global Setup:**
  - All tests use `vitest.setup.ts` for global mocks, polyfills, and environment variables.
  - MSW is configured for Node (Vitest) and browser (Playwright/component tests) with handlers in `src/tests/mocks/handlers.ts`.
  - i18n is initialized for English and mocked for synchronous translation.
  - Providers (Theme, QueryClient, etc.) are wrapped via `renderWithProviders` utility.
- **Mocking Patterns:**
  - **Supabase:** Use the builder chain mock pattern (see issues file for details).
  - **Axios:** Use `vi.spyOn` for direct mocking in Node; MSW for fetch/XHR in browser.
  - **Zustand:** Use centralized store mocks with getState/setState/subscribe/destroy.
  - **API:** Use MSW handlers for all API endpoints; reset state between tests.

## Writing Tests
- Use `userEvent` for all user interactions; always wrap in `await act(async () => { ... })` or `waitFor` for async updates.
- Set up all mocks before importing the module under test; use dynamic import if needed.
- Assert on visible output, not internal state.
- Provide valid, realistic mock data for all required props.
- For i18n, use the provided test setup and ensure all keys are present in en.json.

## Running Tests
- **Unit/Integration:** `pnpm test` or `vitest run` (see package.json for scripts).
- **E2E:** `pnpm e2e` or `playwright test` (see Playwright config for details).
- **Coverage:** `pnpm test --coverage` (thresholds enforced in CI).

## Test Skeletons & Utilities
- Templates for new tests are in `src/tests/integration/` and `src/tests/__helpers__/`.
- Use `renderWithProviders` for all component/integration tests.
- All global mocks/utilities are in `src/tests/mocks/` and `src/tests/utils/`.

## References
- For ongoing issues, solutions, and remediation plans, see `Testing Issues and Solutions.md`.

## Project-Specific Testing Rules (from .cursorrules)

- **File System Diligence:** Before creating ANY new file (including test files, mocks, or helper utilities), you MUST thoroughly check all directories within the workspace to ensure a similar file doesn't already exist elsewhere. Prevent file duplication at all costs.
- **Strict File Structure:** Adhere strictly to the conventions outlined in `docs/File structure guidelines.md` when creating necessary test files, mocks, or related artifacts.
- **Existing Tech Stack Only:** Use only the established testing stack (Vitest, React Testing Library, User Event, MSW, JSDOM, Testing Library Jest DOM). If a new technology is absolutely necessary, you MUST ask before introducing it.
- **Testing Priority:** Focus testing efforts on end-user scenarios. Test the application from the user's perspective, verifying complete user flows (e.g., registration, login, profile update, MFA setup). Prioritize tests that cover critical functionality over low-level unit tests, unless those unit tests are essential for complex logic.
- **No Simplification for Passing Tests:** Do NOT simplify application code, remove features, or alter core functionality just to make tests pass. The application's intended behavior is paramount.
- **Handling Test Failures:**
    - If a test fails due to a problem within the test file itself (e.g., incorrect selectors, faulty mocking, async/timing issues, structure not following guidelines): You have permission to modify the test file (`*.test.tsx`, `*.test.ts`, setup files, mocks) to fix the issue. Refer to `docs/TESTING_ISSUES.md` and this file for known issues and best practices.
    - If a test fails and you suspect the issue lies within the actual application code (i.e., the component or function being tested seems broken or doesn't behave as expected): STOP immediately. Report the failing test, the specific discrepancy you observed, and ask for confirmation and guidance before making any changes to the application source code (`/src/` or `/app/` directories, excluding test files).
- **Global Mocking Policy:** NO LOCAL MOCKS. ALL mocking is done globally. Avoid local mocks in test files; use or extend the global mocks provided in the test setup files.
- **Test Coverage:** Ensure test coverage mirrors implementation as closely as possible. Do not rewrite real functionality only due to failed tests unless the test found a real bug. The real component can be rewritten to be more robust or if it misses features it should have.
- **Documentation:** Document results of the test and ask for next action if unsure. Once a test fails, the most probable reason for failing is a reference to a file that has been moved. For fixes, always review the interdependencies in the files.
- **Skeleton Files:** There are already skeleton files for missing tests—before you create a new file, make sure to search in the skeletons.
- **Complex Codebase Awareness:** Before you change anything, make sure you read other files using the import/component/mock and that you correctly understand that the change will not break anything. For failing tests, read related passing tests and search for patterns. If a similar test is passing, a change in a global mock file is usually not the right solution. Think it through thoroughly!

For further context and the most up-to-date rules, see `.cursorrules` in the project root.
