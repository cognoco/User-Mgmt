# Detailed Testing Analysis and Plan

This document provides a detailed analysis of the current testing setup for the User-Mgmt project, building upon the initial overview and incorporating findings from key configuration and error context files.

## 1. Playwright E2E Test Failures

The provided error contexts from Playwright test runs highlight two key failure scenarios in [`e2e/auth/registration.spec.ts`](e2e/auth/registration.spec.ts:1).

### Safari Error (`User-Reg-03a68`): Submit Button Disabled in Registration Test
*   **Test Case:** `shows success message for at least 2 seconds before redirect after registration`
*   **File:** [`test-results/auth-registration-User-Reg-03a68-redirect-after-registration-Desktop-Safari/error-context.md`](test-results/auth-registration-User-Reg-03a68-redirect-after-registration-Desktop-Safari/error-context.md)
*   **Observation:** The test fails because the "Create Account" button (locator `button[type="submit"]`) remains disabled. The page snapshot within the error context indicates the email input field is empty, despite the test script attempting to fill `[data-testid="email-input"]`. The form state JSON (`{ "isValid": false, ... "email": "" ... }`) included in the snapshot confirms the email field is indeed empty from the form's perspective.
*   **Hypothesis:**
    1.  The `page.fill('[data-testid="email-input"]', uniqueEmail)` command might not be reliably completing its action before the next step, or its value isn't being registered by the form's validation logic in Safari in a timely manner.
    2.  There might be a Safari-specific timing issue or event handling difference related to input fields and form validation that causes the form state not to update as expected.
*   **Recommendations:**
    1.  **Explicit Wait/Blur:** After filling the email input, add an explicit wait or action to ensure the value is registered and validation (if any) is triggered.
        ```typescript
        // In e2e/auth/registration.spec.ts
        await page.fill('[data-testid="email-input"]', uniqueEmail);
        // Option A: Wait for the value to be reflected in the input's property
        await page.waitForFunction((selector) => document.querySelector(selector)?.value === uniqueEmail, '[data-testid="email-input"]');
        // Option B: Try blurring the input to trigger validation/update events
        // await page.locator('[data-testid="email-input"]').blur();
        ```
    2.  **Review Form Logic:** Examine the React component responsible for the registration form. Ensure its validation logic correctly updates the form's validity state and enables the submit button once all required fields, including a correctly formatted email, are present and recognized. Check for any browser-specific handling that might affect Safari.

### Chrome Error (`User-Reg-9baae`): Rate Limit Exceeded / No Success Message in Registration Test
*   **Test Case:** `should allow a new user to register and see a success message or redirect`
*   **File:** [`test-results/auth-registration-User-Reg-9baae-success-message-or-redirect-Desktop-Chrome/error-context.md`](test-results/auth-registration-User-Reg-9baae-success-message-or-redirect-Desktop-Chrome/error-context.md)
*   **Observation:** The test times out waiting for an expected success message (e.g., "Check your email", "Verification email sent", or "Verify your email"). The page snapshot reveals a "Registration Failed - email rate limit exceeded" alert.
*   **Hypothesis:** The registration attempt triggers a rate limit on the backend, causing the rate limit alert to be displayed *instead* of the success message. The existing test logic has a `Promise.race` to catch rate limit errors before clicking submit, but this failure occurs *after* submission while waiting for the success message.
*   **Recommendations:**
    1.  **Robust Post-Submit Assertion:** Modify the assertion after clicking the submit button to explicitly check for either the success message OR the rate limit exceeded message.
        ```typescript
        // In e2e/auth/registration.spec.ts, after submitButton.click();
        const successMessageLocator = page.locator('text=Check your email')
                                        .or(page.locator('text=Verification email sent'))
                                        .or(page.locator('text=Verify your email'));
        // Use a more specific locator for the rate limit alert if possible, e.g., based on a data-testid
        const rateLimitAlertLocator = page.locator('div[role="alert"]:has-text("rate limit exceeded")');

        // Wait for either to be visible, increasing timeout slightly if needed
        await expect(successMessageLocator.or(rateLimitAlertLocator)).toBeVisible({ timeout: 15000 });

        if (await rateLimitAlertLocator.isVisible()) {
          console.warn('Rate limit hit after registration attempt. Test will pass for this specific scenario.');
          // Consider if this should be a pass or a specific "skipped due to rate limit" outcome
          return;
        }
        // If rate limit alert is not visible, then the success message must be
        await expect(successMessageLocator).toBeVisible();
        ```
    2.  **Primary Strategy for Rate Limiting (API Mocking):** For the majority of E2E tests involving registration or other API calls prone to rate limits, **mock the API endpoints** using Playwright's `page.route()` functionality. This will:
        *   Make tests significantly faster.
        *   Improve test reliability by removing external dependencies.
        *   Prevent exhaustion of backend rate limits during test runs.
        Reserve a very small number of "smoke tests" that hit the actual backend, and these should have specific handling or expectations for rate limits.
    3.  **Specific Rate Limit Locator:** Ensure the locator for the rate limit alert is robust and not prone to flakiness (e.g., using `data-testid` if available, or a combination of role and text as shown above).

### General Playwright Configuration (`playwright.config.ts`)
*   The current configuration in [`playwright.config.ts`](playwright.config.ts) (`retries: 1`, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`) is well-suited for debugging CI failures.
*   The use of `baseURL: 'http://localhost:3000'` is standard.
*   The project definitions for different browsers (`Desktop Chrome`, `Mobile Chrome`, `Desktop Firefox`, `Desktop Safari`) provide good coverage.
*   Continue to emphasize the use of `data-testid` attributes for element locators as a best practice, which appears to be generally followed in the test snippets.

## 2. Vitest "Skeleton" Integration Tests

*   **Observation:** The project contains numerous `*.Skeleton.integration.test.tsx` files within the `src/tests/integration/` directory. These are clearly intended as templates or starting points for new integration tests.
*   **Recommendation:** The strategy outlined in [`_testing-analysis/TESTING_STRATEGY_OVERVIEW.md`](_testing-analysis/TESTING_STRATEGY_OVERVIEW.md) (specifically the Mermaid diagram flow for handling skeletons) remains the most appropriate course of action.
    *   **Initial Action (Plan A):** "Clean them up & Write Clear Instructions." This involves:
        1.  Reviewing all skeleton files.
        2.  Consolidating them into a smaller set of high-quality, well-documented templates that cover common integration testing scenarios.
        3.  Documenting their purpose and usage thoroughly in the project's testing guidelines.
    *   **Contingency (Plan B):** If refining skeletons proves insufficient or too cumbersome, then explore creating a "Test Generator" CLI tool or script that can scaffold new integration tests based on prompts or component names.

## 3. Vitest Setup, Mocks, and Utilities

Analysis of [`src/tests/setup.ts`](src/tests/setup.ts), [`src/tests/setup.tsx`](src/tests/setup.tsx), [`src/tests/utils/test-utils.tsx`](src/tests/utils/test-utils.tsx), and [`src/tests/mocks/browser.ts`](src/tests/mocks/browser.ts) reveals a generally sound setup for Vitest.

*   **Global Mocks and Setup:**
    *   **[`src/tests/setup.ts`](src/tests/setup.ts):** This file correctly handles mocks for the Node.js environment that Vitest runs in. Key items:
        *   Imports [`./i18nTestSetup`](./i18nTestSetup) (presumably for i18next initialization).
        *   Sets dummy environment variables for Supabase client (essential for tests not to fail on missing env vars).
        *   Mocks `next/navigation` (App Router).
        *   Mocks the Prisma client (`@/lib/prisma`) with `vi.fn()` for its various model methods. This is a good approach for controlling Prisma interactions in tests.
    *   **[`src/tests/setup.tsx`](src/tests/setup.tsx):** This file configures the JSDOM/React testing environment. Key items:
        *   Extends Vitest's `expect` with `@testing-library/jest-dom/matchers`.
        *   Globally mocks several UI components from `@/components/ui/*` by rendering simple HTML equivalents.
        *   Mocks `next/router` (Pages Router - verify if still needed or if `next/navigation` is primary).
        *   Mocks `next/image` to render a simple `<img>` tag.
        *   Mocks `localStorage` and `matchMedia`.
        *   **Crucially, sets up the MSW Node server via `setupServer()` for API mocking.** This includes `server.listen()`, `server.close()`, and `server.resetHandlers()` in `beforeAll`, `afterAll`, and `afterEach` respectively, which is best practice.

*   **MSW (Mock Service Worker) Configuration:**
    *   [`src/tests/mocks/browser.ts`](src/tests/mocks/browser.ts) initializes `setupWorker()` and notes that "No global MSW handlers are registered, as all MSW usage is local to specific test files." This `setupWorker` is for tests running in an actual browser context (e.g., Playwright component tests if used, or Storybook).
    *   The `setupServer()` in [`src/tests/setup.tsx`](src/tests/setup.tsx) is the relevant MSW instance for Vitest tests running in Node.
    *   **Recommendation for MSW Handlers:** To improve organization and reusability of API mocks, create a dedicated location for MSW request handlers. For example:
        *   `src/tests/mocks/handlers.ts` (for a flat list)
        *   `src/tests/mocks/handlers/index.ts` (barrel file if multiple handler files are grouped by feature/API)
        These common handlers should then be imported into `src/tests/setup.tsx` and passed to `setupServer(...handlers)`. Individual tests can still add their own specific handlers or override global ones using `server.use()`.
*   **MSW Server Setup ([`src/tests/mocks/server.ts`](src/tests/mocks/server.ts:1)):**
    *   **Purpose:** This file is responsible for creating and configuring the MSW (Mock Service Worker) server instance used for intercepting and mocking API requests during Vitest tests running in a Node.js environment.
    *   **Implementation:**
        *   It utilizes `setupServer` from `msw/node` to create the server.
        *   It imports `handlers` (the array of request handlers) and `resetMockPreferences` from [`./handlers.ts`](src/tests/mocks/handlers.ts:1). The `handlers` are passed to `setupServer` to define the mock API behavior. The `resetMockPreferences` function is also imported but its usage is within [`./handlers.ts`](src/tests/mocks/handlers.ts:1) itself or potentially by tests directly if needed, not directly by `server.ts`.
        *   The configured `server` instance is exported for use in the global test setup.
    *   **Lifecycle Management:** The lifecycle methods (`server.listen()`, `server.resetHandlers()`, `server.close()`) are correctly managed within [`src/tests/setup.tsx`](src/tests/setup.tsx:1) (`beforeAll`, `afterEach`, `afterAll` respectively), which is the standard and recommended practice.
    *   **Observations & Recommendations:**
        *   The setup in this file is straightforward and follows MSW best practices for Node environments.
        *   Its effectiveness is directly dependent on the quality and coverage of the request handlers defined in [`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1).
        *   No immediate issues are apparent within `server.ts` itself.

*   **MSW Request Handlers ([`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1)):**
    *   **Purpose:** This file defines the actual request handler logic for mocked API endpoints, primarily focusing on user preferences (`/api/preferences`) in the current version. It's designed to be the central place for global API mock definitions.
    *   **Key Components:**
        *   `mockUserPreferences`: A mutable `let` variable that stores the in-memory state of user preferences. It's initialized with default values using `faker` for the ID and a static `userId` for consistency across tests. This variable is directly manipulated by the PATCH handler to simulate backend data persistence.
        *   `handlers` Array:
            *   `http.get('/api/preferences')`: Returns the current state of `mockUserPreferences`.
            *   `http.patch('/api/preferences')`: Accepts partial updates, merges them with the current `mockUserPreferences` (including a deep merge for the nested `notifications` object), updates the `updatedAt` timestamp, and returns the new state.
        *   `resetMockPreferences()`: An exported function that resets the `mockUserPreferences` variable back to its initial default state. This is crucial for ensuring test isolation when dealing with stateful mocks.
    *   **Observations & Recommendations:**
        *   **Stateful Mocking:** The use of a module-scoped mutable variable (`mockUserPreferences`) makes these mocks stateful. While useful for testing sequential interactions, it necessitates careful state management between tests.
        *   **Test Isolation:** The `server.resetHandlers()` called in [`src/tests/setup.tsx`](src/tests/setup.tsx:1) will reset any runtime modifications to the handlers themselves (e.g., those added with `server.use()`) but **will not** reset the state of `mockUserPreferences` because it's a variable within the `handlers.ts` module scope.
        *   **Recommendation for State Reset:** To ensure tests are independent, the `resetMockPreferences()` function **must** be called before or after each test that might interact with these preference mocks. This could be added to the global `afterEach` in [`src/tests/setup.tsx`](src/tests/setup.tsx:1) alongside `server.resetHandlers()`.
            ```typescript
            // Suggestion for src/tests/setup.tsx
            import { resetMockPreferences } from './mocks/handlers'; // Add this import

            afterEach(() => {
              server.resetHandlers();
              resetMockPreferences(); // Call this to reset the state of mocks in handlers.ts
            });
            ```
        *   **Clarity & Correctness:** The existing handlers for `/api/preferences` are well-defined, and the PATCH logic correctly handles nested updates for notifications.
        *   **Extensibility:** The file is structured to accommodate more global handlers as the application grows.
*   **UI Component Mocks in `setup.tsx`:**
    *   The global mocking of basic UI components (`Button`, `Label`, `Input`, `Checkbox`, `Alert`) as simple HTML elements is a common pattern to speed up tests and isolate component logic.
    *   **Consideration:** For integration tests focusing on user flows, these broad mocks might sometimes hide issues related to the actual behavior, accessibility, or styling of these shared UI components.
    *   **Recommendation:**
        *   Maintain these global mocks for speed in most unit/integration tests.
        *   For critical integration flows where the interaction with these specific UI components is important, consider allowing tests to render the *actual* components. This could be achieved by:
            *   Providing a mechanism for individual test files to unmock specific components (e.g., using `vi.doUnmock('@/components/ui/button')` within a `beforeEach` of a specific test suite).
            *   Refraining from globally mocking highly interactive or critical shared components if their actual behavior is frequently needed in integration tests.

*   **Router Mocks (`next/navigation` vs. `next/router`):**
    *   As noted, `setup.ts` mocks `next/navigation` (used by Next.js App Router).
    *   `setup.tsx` mocks `next/router` (used by Next.js Pages Router or older Next.js versions).
    *   **Action:** Verify if the project uses both router systems. If the project has fully migrated to the App Router, the `next/router` mock in `setup.tsx` might be legacy and could potentially be removed or conditionally applied.

*   **Custom Render Utility (`src/tests/utils/test-utils.tsx`):**
    *   The custom `render` function that re-exports from `@testing-library/react` and wraps the UI in `<React.StrictMode>` is good practice. This helps catch potential issues related to Strict Mode early in development.

## 4. Proposed Documentation and Next Steps

1.  **Consolidate This Analysis:** This document serves as the consolidated detailed analysis.
2.  **Refine Action Plan (Iterative):** Based on this analysis, specific, actionable tasks should be created and prioritized for improving the testing setup. These might include:
    *   Addressing the Playwright test failures with the recommended code changes.
    *   Implementing centralized MSW handlers.
    *   Reviewing and refining the UI component mocking strategy.
    *   Tackling the "skeleton" integration tests.
3.  **Develop Comprehensive Testing Guidelines:** Create or update testing documentation within the `_testing-analysis/docs/` directory (e.g., `_testing-analysis/docs/TESTING_GUIDELINES.md`). This should cover:
    *   **General Principles:** Philosophy of testing in this project, what to test and where (unit, integration, E2E).
    *   **Playwright E2E Tests:**
        *   Best practices for writing stable locators (prioritizing `data-testid`).
        *   Strategies for handling dynamic content and asynchronous operations.
        *   Guidelines for mocking API calls (using `page.route()`) versus hitting live dev environments.
        *   How to debug failed E2E tests using traces and videos.
        *   Specific advice on handling rate limits.
    *   **Vitest Unit & Integration Tests:**
        *   How to use the refined skeleton templates or the (potential) test generator tool.
        *   When to mock dependencies versus using real implementations.
        *   Clear guidelines on using MSW for API mocking in Vitest, including how to use centralized handlers and add test-specific overrides.
        *   Guidance on mocking React components and when it's appropriate.
    *   **Mocking Strategy:**
        *   Documenting how to mock Prisma, external services, `localStorage`, `matchMedia`, etc.
        *   Location and structure of mock files.
    *   **Running Tests:** Instructions for running different types of tests locally and understanding CI output.

This structured approach will help in systematically improving the test suite's reliability, maintainability, and coverage.
*   **MSW Browser Setup ([`src/tests/mocks/browser.ts`](src/tests/mocks/browser.ts:1)):**
    *   **Purpose:** This file configures MSW for use in browser environments, distinct from the Node.js setup for Vitest. This is typically used for E2E tests (like Playwright, if component testing features are used with mocks) or for manual testing of components in a browser with mocked API responses.
    *   **Implementation:**
        *   It imports `setupWorker` from `msw/browser`.
        *   It imports the shared `handlers` array from [`./handlers.ts`](src/tests/mocks/handlers.ts:1).
        *   It exports a `worker` instance, initialized by calling `setupWorker(...handlers)`.
    *   **Observations & Recommendations:**
        *   The setup is standard for MSW in the browser.
        *   The comment `// Configure a Service Worker with the shared handlers.` accurately describes its function.
        *   This setup allows the same mock definitions from [`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1) to be used in both Node.js (via `server.ts`) and browser testing environments, ensuring consistency.
        *   No immediate issues are apparent. If E2E tests or in-browser component tests need to mock API calls, this `worker` would be started in that environment's setup.
*   **i18n Test Setup ([`src/tests/i18nTestSetup.ts`](src/tests/i18nTestSetup.ts:1)):**
    *   **Purpose:** Configures `i18next` and `react-i18next` for the testing environment, ensuring components that use translations can be tested effectively.
    *   **Key Components:**
        *   **Resources:** Loads English translations from [`@/lib/i18n/locales/en.json`](lib/i18n/locales/en.json:3) and organizes them into namespaces ([`src/tests/i18nTestSetup.ts:6-17`](src/tests/i18nTestSetup.ts:6)).
        *   **`resolveKey` Helper:** A utility ([`src/tests/i18nTestSetup.ts:20-23`](src/tests/i18nTestSetup.ts:20)) to look up translation keys, returning the key itself if the translation is not found. This is beneficial for identifying missing translations during tests.
        *   **`react-i18next` Mock ([`src/tests/i18nTestSetup.ts:25-34`](src/tests/i18nTestSetup.ts:25)):**
            *   Mocks `useTranslation` to provide a `t` function that uses the `resolveKey` helper with English translations.
            *   Mocks the `Trans` component to render the resolved key.
            *   Mocks `initReactI18next` as a no-op, since `i18n` is initialized directly.
        *   **`i18n` Initialization ([`src/tests/i18nTestSetup.ts:36-44`](src/tests/i18nTestSetup.ts:36)):** Initializes the `i18n` instance with English as the language, the defined resources, and namespaces. Suspense is disabled for React, which is typical for tests.
    *   **Observations & Recommendations:**
        *   The setup provides a robust mock for `react-i18next`, making translation-dependent components testable.
        *   The `resolveKey` helper is a good strategy for handling missing translations in tests.
        *   The mock for the `Trans` component is basic; if complex `Trans` features (like embedded components) are heavily used and need testing, this mock might need to be more sophisticated for specific test suites.
        *   The configuration is hardcoded for English. If multilingual testing becomes a requirement, this setup would need parameterization.
        *   The initialized `i18n` instance is exported and used globally via [`src/tests/setup.ts`](src/tests/setup.ts:1), ensuring i18n is ready for all Vitest tests.
        *   Overall, this is a well-structured and effective setup for i18n in a testing environment.
*   **General Test Mocks ([`src/tests/mocks/test-mocks.ts`](src/tests/mocks/test-mocks.ts:1)):**
    *   **Purpose:** This file provides a centralized collection of TypeScript types and factory functions for creating mock data and store states, primarily focused on authentication, for use across the test suite.
    *   **Key Components:**
        *   **`MockAuthStore` Type ([`src/tests/mocks/test-mocks.ts:5-9`](src/tests/mocks/test-mocks.ts:5)): A mapped type that converts `AuthState` functions into Vitest `Mock` functions, preserving other property types. This ensures the mock store has a compatible API with the real store.
        *   **`MockAuthState` Type ([`src/tests/mocks/test-mocks.ts:12-18`](src/tests/mocks/test-mocks.ts:12)): A simplified type for representing basic auth state.
        *   **`MockAuthResponse` Type ([`src/tests/mocks/test-mocks.ts:21-26`](src/tests/mocks/test-mocks.ts:21)): Defines the structure for mock API responses related to authentication.
        *   **`createMockAuthStore()` Function ([`src/tests/mocks/test-mocks.ts:29-59`](src/tests/mocks/test-mocks.ts:29)): A factory function that produces a fully typed mock authentication store. It initializes state properties to default values and all store actions (e.g., `login`, `register`, `logout`, `setupMFA`) as `vi.fn()` with type signatures imported from the application's actual type definitions (`@/types/auth`).
        *   **`createMockSamlConfig()` Function ([`src/tests/mocks/test-mocks.ts:62-76`](src/tests/mocks/test-mocks.ts:62)): A factory to create mock SAML configuration objects, providing defaults and allowing overrides.
        *   **`createMockOidcConfig()` Function ([`src/tests/mocks/test-mocks.ts:79-92`](src/tests/mocks/test-mocks.ts:79)): A factory to create mock OIDC configuration objects, with defaults and override capabilities.
    *   **Observations & Recommendations:**
        *   **Comprehensive and Typed:** The `createMockAuthStore` function is very thorough and its use of explicitly typed `vi.fn` mocks (e.g., `vi.fn<[import('@/types/auth').LoginPayload], Promise<import('@/types/auth').AuthResult>>()` for `login`) is a best practice for type safety and maintainability.
        *   **Centralized & Reusable:** Consolidating these mocks improves consistency and reduces boilerplate in individual test files.
        *   **Clear API Documentation:** The typed mock functions in `createMockAuthStore` implicitly document the expected parameters and return types of the actual auth store actions.
        *   **SSO Config Mocks:** The `createMockSamlConfig` and `createMockOidcConfig` helpers simplify testing features that rely on these SSO configurations.
        *   This file is well-structured and provides essential utilities for testing authentication-related functionality. No immediate issues are noted.
*   **Custom Render Utility ([`src/tests/utils/test-utils.tsx`](src/tests/utils/test-utils.tsx:1)):**
    *   **Purpose:** Provides a custom `render` function that wraps UI components in `<React.StrictMode>` and re-exports all utilities from `@testing-library/react`.
    *   **Implementation:**
        *   Imports `React` and `render` as `rtlRender` from `@testing-library/react`.
        *   The custom [`render`](src/tests/utils/test-utils.tsx:4) function defines a `Wrapper` component that encloses children in `<React.StrictMode>`.
        *   It calls `rtlRender` with the provided UI, the custom `Wrapper`, and any other `renderOptions`.
        *   Re-exports all from `@testing-library/react` and then overrides the `render` export with the custom one.
    *   **Observations & Recommendations:**
        *   **Good Practice:** Enforcing `<React.StrictMode>` in tests helps detect potential issues early.
        *   **Convenience:** Centralizes testing library imports and ensures the custom `render` is always used.
        *   **Simplicity:** The utility is clear and correctly implemented for its intended purpose.
        *   **No Global Providers:** The current `Wrapper` does not include any application-wide context providers (e.g., ThemeProvider, Redux store, Router). If such providers are commonly needed for components to render correctly in tests, they should be added to this `Wrapper`. For instance:
            ```tsx
            // Example if a ThemeProvider and Router were needed
            // function Wrapper({ children }: { children: React.ReactNode }) {
            //   return (
            //     <React.StrictMode>
            //       <ThemeProvider>
            //         <Router> {/* Assuming a Router context provider */}
            //           {children}
            //         </Router>
            //       </ThemeProvider>
            //     </React.StrictMode>
            //   );
            // }
            ```
        *   The absence of global providers might imply that either components are tested in isolation without needing them, or providers are added specifically in test suites where required. Given the application's features, some global providers might be beneficial for more comprehensive integration tests. This should be evaluated based on common testing needs.
*   **Supabase Client Mock ([`src/tests/mocks/supabase.ts`](src/tests/mocks/supabase.ts:1)):**
    *   **Purpose:** Provides a comprehensive mock of the Supabase client for Vitest, allowing for isolated testing of Supabase-dependent application logic.
    *   **Key Components:**
        *   **`createMockBuilder()` ([`src/tests/mocks/supabase.ts:28-55`](src/tests/mocks/supabase.ts:28)): A sophisticated helper function to mock Supabase's fluent query builder.
            *   It creates a generic `builder` where methods like [`select()`](src/tests/mocks/supabase.ts:42), [`insert()`](src/tests/mocks/supabase.ts:42), [`eq()`](src/tests/mocks/supabase.ts:47), [`filter()`](src/tests/mocks/supabase.ts:47), etc., are `vi.fn()` instances that return the `builder` itself, enabling realistic chainability in tests.
            *   A crucial `builder.then = vi.fn()` ([`src/tests/mocks/supabase.ts:52`](src/tests/mocks/supabase.ts:52)) is added, allowing tests to mock the promise resolution/rejection at the end of a query chain (e.g., `mockBuilder.select().eq().then.mockResolvedValue(...)`).
        *   **`mockSupabase` Object ([`src/tests/mocks/supabase.ts:57-98`](src/tests/mocks/supabase.ts:57)):**
            *   **`auth` Module ([`src/tests/mocks/supabase.ts:58-81`](src/tests/mocks/supabase.ts:58)):** Mocks all major authentication methods (`getUser`, `signInWithPassword`, `signUp`, `signOut`, `onAuthStateChange`, `getSession`, etc.) and the `mfa` submodule (`listFactors`, `challenge`, `verify`, `enroll`, `unenroll`). Each is a `vi.fn()` typed with original Supabase types for parameters and return values.
            *   **`storage` Module ([`src/tests/mocks/supabase.ts:82-91`](src/tests/mocks/supabase.ts:82)):** The `from()` method returns an object with mock storage operations (`upload`, `download`, `getPublicUrl`, etc.).
            *   **`rpc()` Method ([`src/tests/mocks/supabase.ts:92`](src/tests/mocks/supabase.ts:92)):** A typed `vi.fn()` for mocking RPC calls.
            *   **`channel()` Method ([`src/tests/mocks/supabase.ts:93-96`](src/tests/mocks/supabase.ts:93)):** Mocks real-time channel functionality.
            *   **`from()` Method ([`src/tests/mocks/supabase.ts:97`](src/tests/mocks/supabase.ts:97)):** The entry point for database queries, which returns an instance of the `createMockBuilder()`.
        *   **Export:** The `mockSupabase` object is exported as `supabase` after being cast `as unknown as SupabaseClient` ([`src/tests/mocks/supabase.ts:102`](src/tests/mocks/supabase.ts:102)) to satisfy TypeScript type checking where the mock is used.
    *   **Observations & Recommendations:**
        *   **Comprehensive & Typed:** The mock is extensive and makes excellent use of TypeScript types imported from `@supabase/supabase-js` to ensure mock functions have correct signatures. This greatly aids in writing type-safe tests.
        *   **Flexible Query Mocking:** The `createMockBuilder` function is a powerful solution for testing code that uses Supabase's fluent query interface, allowing tests to define the outcome of complex queries.
        *   **Pragmatic Casting:** The `as unknown as SupabaseClient` cast is a common and practical approach for complex mock objects, enabling them to be used in place of the real client in typed codebases.
        *   **Default Behavior:** Most mocked methods are `vi.fn()` without default implementations, requiring tests to specify return values (e.g., using `mockResolvedValueOnce`). The `getSession()` method is an exception, defaulting to returning a null session.
        *   **Maintainability:** This mock provides a solid foundation for testing. As the application's use of Supabase evolves, or as Supabase itself updates its client API, this mock file (especially type signatures) will need to be kept in sync.
        *   This is a high-quality mock that significantly enhances testability.
*   **MSW API Mock Handlers ([`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1)):**
    *   **Purpose:** Defines request handlers using MSW (Mock Service Worker) to mock API endpoints related to user preferences. This allows tests to simulate backend responses and behavior in a controlled manner.
    *   **Key Features:**
        *   **Stateful Mock Data (`mockUserPreferences` ([`src/tests/mocks/handlers.ts:8-23`](src/tests/mocks/handlers.ts:8))):** An in-memory variable `mockUserPreferences` of type `UserPreferences` (from [`@/types/database`](src/types/database.ts:1)) holds the current state of user preferences. It's initialized with default values, including a `faker.string.uuid()` for the `id` and a static `userId` for test consistency. This state is modified by the `PATCH` handler.
        *   **GET `/api/preferences` Handler ([`src/tests/mocks/handlers.ts:27-29`](src/tests/mocks/handlers.ts:27)):**
            *   Intercepts `GET` requests to `/api/preferences`.
            *   Responds with the current `mockUserPreferences` object as JSON.
        *   **PATCH `/api/preferences` Handler ([`src/tests/mocks/handlers.ts:32-49`](src/tests/mocks/handlers.ts:32)):**
            *   Intercepts `PATCH` requests to `/api/preferences`.
            *   Reads the request body, expecting `Partial<Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>`. This correctly types the expected partial update, excluding server-managed fields.
            *   Updates the in-memory `mockUserPreferences` state. It correctly handles merging nested objects (specifically `notifications` ([`src/tests/mocks/handlers.ts:37-39`](src/tests/mocks/handlers.ts:37))) and updates the `updatedAt` timestamp.
            *   Responds with the updated `mockUserPreferences` object as JSON.
        *   **`resetMockPreferences()` Function ([`src/tests/mocks/handlers.ts:55-72`](src/tests/mocks/handlers.ts:55)):**
            *   An exported utility function to reset `mockUserPreferences` to its initial default state.
            *   Crucial for test isolation, typically used in `beforeEach` or `afterEach` hooks in the test setup ([`src/tests/setup.ts`](src/tests/setup.ts:1)).
    *   **Observations & Recommendations:**
        *   **Effective API Simulation:** These handlers provide a realistic simulation of a preferences API, including state changes based on `PATCH` requests.
        *   **Type Safety:** The use of `UserPreferences` type throughout ensures that the mock handlers and the data they manage align with the application's data structures.
        *   **Test Isolation:** The `resetMockPreferences` function is a key best practice for ensuring that tests do not interfere with each other by leaking state.
        *   **Clarity and Maintainability:** The code is well-commented and clearly structured, making it easy to understand and maintain.
        *   The static `userId` ([`src/tests/mocks/handlers.ts:10`](src/tests/mocks/handlers.ts:10)) is good for predictability. Consider if the preference `id` ([`src/tests/mocks/handlers.ts:9`](src/tests/mocks/handlers.ts:9) and [`src/tests/mocks/handlers.ts:57`](src/tests/mocks/handlers.ts:57)) should also be static if tests rely on a specific ID.
        *   This is a solid implementation for mocking the preferences API, enabling robust testing of features that depend on these settings.
*   **MSW Server Setup ([`src/tests/mocks/server.ts`](src/tests/mocks/server.ts:1)):**
    *   **Purpose:** Configures and exports the MSW (Mock Service Worker) server instance for use in the Node.js testing environment (e.g., Vitest).
    *   **Key Features:**
        *   **Imports `setupServer` from `msw/node` ([`src/tests/mocks/server.ts:2`](src/tests/mocks/server.ts:2)):** This function is specifically designed to create an MSW server that works in Node.js environments by intercepting outgoing HTTP requests at the network level.
        *   **Imports `handlers` and `resetMockPreferences` from `./handlers` ([`src/tests/mocks/server.ts:3`](src/tests/mocks/server.ts:3)):**
            *   `handlers`: The array of request handlers defined in [`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1) is imported to be registered with the server.
            *   `resetMockPreferences`: Although not directly called in this file, its import and the accompanying comments ([`src/tests/mocks/server.ts:8-11`](src/tests/mocks/server.ts:8)) indicate its intended use for resetting mock data state, likely within the global test setup ([`src/tests/setup.ts`](src/tests/setup.ts:1)).
        *   **Server Initialization (`export const server = setupServer(...handlers);` ([`src/tests/mocks/server.ts:6`](src/tests/mocks/server.ts:6))):**
            *   An MSW server instance is created using `setupServer`, and all handlers from the `handlers` array are registered with it using the spread operator.
            *   The `server` object is exported. This object provides methods like `listen()`, `resetHandlers()`, and `close()`, which are used in the global test setup file ([`src/tests/setup.ts`](src/tests/setup.ts:1)) to manage the server's lifecycle (start before tests, potentially reset between tests, and stop after tests).
    *   **Observations & Recommendations:**
        *   **Standard Configuration:** This is a typical and correct setup for MSW in a Node.js testing environment.
        *   **Separation of Concerns:** This file focuses solely on creating the server instance. The management of the server's lifecycle (start, stop) and data reset logic (`resetMockPreferences`) is appropriately deferred to the global test setup file.
        *   **Centralized Handlers:** It correctly incorporates the handlers defined in [`src/tests/mocks/handlers.ts`](src/tests/mocks/handlers.ts:1), ensuring that all mock API behavior is sourced from a single place.
        *   This file correctly sets up the foundation for API mocking across the test suite.
*   **Global Test Setup ([`src/tests/setup.ts`](src/tests/setup.ts:1)):**
    *   **Purpose:** This file is executed by Vitest before any tests run. It configures the global testing environment, setting up mocks, API interception, and utilities necessary for the entire test suite.
    *   **Key Features & Configurations:**
        *   **i18n Setup ([`src/tests/setup.ts:1`](src/tests/setup.ts:1)):** Imports [`./i18nTestSetup`](./i18nTestSetup.ts:1) to configure internationalization for tests.
        *   **Supabase Environment Variables ([`src/tests/setup.ts:4-5`](src/tests/setup.ts:4)):** Sets dummy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables. This allows the Supabase client to initialize in a test environment without requiring actual credentials, as API calls are expected to be mocked by MSW.
        *   **Jest-DOM Matchers ([`src/tests/setup.ts:7`](src/tests/setup.ts:7)):** Imports `@testing-library/jest-dom` to extend Vitest's `expect` with useful DOM assertion matchers (e.g., `toBeInTheDocument`, `toHaveTextContent`).
        *   **MSW Server Lifecycle ([`src/tests/setup.ts:10, 18, 22-25, 28`](src/tests/setup.ts:10)):**
            *   Imports the `server` instance from [`./mocks/server.ts`](./mocks/server.ts:1).
            *   `beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));`: Starts the MSW server before all tests begin. The `onUnhandledRequest: 'error'` option is crucial as it will cause tests to fail if an API request is made that doesn't have a corresponding mock handler, preventing accidental real API calls.
            *   `afterEach(() => { server.resetHandlers(); resetMockPreferences(); });`: After each test:
                *   `server.resetHandlers()`: Clears any runtime request handlers added during a specific test (via `server.use()`), ensuring a clean slate for subsequent tests.
                *   `resetMockPreferences()`: Calls the imported function from [`./mocks/handlers.ts`](./mocks/handlers.ts:1) to reset the in-memory mock preference data. This is essential for test isolation, ensuring that preference-related tests don't interfere with each other.
            *   `afterAll(() => server.close());`: Shuts down the MSW server after all tests have completed.
        *   **Next.js Navigation Mocking ([`src/tests/setup.ts:31-40`](src/tests/setup.ts:31)):**
            *   Uses `vi.mock` to provide mock implementations for `next/navigation`, specifically the `useRouter` and `useSearchParams` hooks.
            *   The mock `useRouter` returns an object with `vi.fn()` stubs for `push`, `replace`, and `prefetch`.
            *   The mock `useSearchParams` returns an object with a `vi.fn()` stub for `get`.
            *   This prevents tests from relying on the actual Next.js routing system and allows for assertions on navigation calls.
        *   **Prisma Client Mocking ([`src/tests/setup.ts:43-57`](src/tests/setup.ts:43)):**
            *   Uses `vi.mock` to mock the Prisma client module (assumed to be at `@/lib/prisma`).
            *   It provides mock functions (`vi.fn()`) for various Prisma model operations (e.g., `findMany`, `create`, `update`, `delete`) for `domain` and `ssoConfig` models. This prevents tests from making actual database calls.
        *   **Removed Mocks ([`src/tests/setup.ts:59-64`](src/tests/setup.ts:59)):** Comments indicate that previous global mocks for `react-i18next` and Radix UI `PointerEvent` polyfills have been removed, with `react-i18next` likely handled elsewhere (e.g., `vitest.setup.ts`) and pointer event issues possibly unresolved.
    *   **Observations & Recommendations:**
        *   **Thorough Setup:** This file establishes a comprehensive pre-test environment, addressing common needs like API mocking, DOM assertions, and framework-specific mocking (Next.js, Prisma).
        *   **Best Practices for MSW:** The MSW lifecycle management (`listen`, `resetHandlers`, `close`) and data reset (`resetMockPreferences`) adhere to best practices for test isolation and reliability. The `onUnhandledRequest: 'error'` setting is particularly valuable for catching unmocked API calls.
        *   **Effective Dependency Isolation:** Mocking `next/navigation` and Prisma effectively decouples tests from external systems, allowing for more focused and faster unit/integration tests.
        *   The separation of i18n concerns into [`./i18nTestSetup.ts`](./i18nTestSetup.ts:1) is good for modularity.
*   **Internationalization Test Setup ([`src/tests/i18nTestSetup.ts`](src/tests/i18nTestSetup.ts:1)):**
    *   **Purpose:** Configures `i18next` and mocks `react-i18next` to provide a consistent and simple way to handle translations within the test environment, primarily focusing on English.
    *   **Key Features & Configurations:**
        *   **Imports ([`src/tests/i18nTestSetup.ts:1-3`](src/tests/i18nTestSetup.ts:1)):**
            *   `i18next` core library.
            *   `initReactI18next` from `react-i18next`.
            *   English translation JSON (`en.json`) from [`@/lib/i18n/locales/en.json`](lib/i18n/locales/en.json:1).
        *   **Resource Definition ([`src/tests/i18nTestSetup.ts:6-17`](src/tests/i18nTestSetup.ts:6)):**
            *   Loads the `en.json` content into the `resources` object for the 'en' language.
            *   The entire `en.json` is mapped to the default `translation` namespace.
            *   Top-level keys within `en.json` (e.g., `common`, `auth`, `profile`) are also explicitly mapped as individual namespaces.
        *   **`resolveKey` Helper ([`src/tests/i18nTestSetup.ts:20-23`](src/tests/i18nTestSetup.ts:20)):**
            *   A utility function that takes a dot-separated key (e.g., `auth.login.button`) and the `en.json` object.
            *   It attempts to resolve the nested key and returns the string value if found.
            *   If the key is not found or the value isn't a string, it returns the original key, mimicking `i18next`'s default fallback behavior.
        *   **`react-i18next` Mocking ([`src/tests/i18nTestSetup.ts:25-34`](src/tests/i18nTestSetup.ts:25)):**
            *   `vi.mock('react-i18next', ...)`: Mocks the `react-i18next` library.
            *   `useTranslation`: The hook is mocked to return a `t` function that uses `resolveKey` to directly look up translations from the imported `en.json` data.
            *   `Trans`: The component is mocked to also use `resolveKey` with its `i18nKey` prop, effectively rendering the translated string directly.
            *   `initReactI18next`: Mocked with a no-op `init` function to satisfy `i18n.use(initReactI18next)`.
        *   **`i18next` Instance Initialization ([`src/tests/i18nTestSetup.ts:36-44`](src/tests/i18nTestSetup.ts:36)):**
            *   Despite mocking `react-i18next`, the core `i18n` instance is still initialized using `i18n.use(initReactI18next).init(...)`.
            *   Configuration:
                *   `lng: 'en'`, `fallbackLng: 'en'`: Sets language and fallback to English.
                *   `resources`: Uses the defined English resources.
                *   `ns`: Declares all configured namespaces (e.g., 'translation', 'common', 'auth').
                *   `defaultNS: 'translation'`.
                *   `interpolation: { escapeValue: false }` (React handles escaping).
                *   `react: { useSuspense: false }` (disables Suspense for simpler testing).
        *   **Export ([`src/tests/i18nTestSetup.ts:46`](src/tests/i18nTestSetup.ts:46)):** Exports the configured `i18n` instance.
    *   **Observations & Recommendations:**
        *   **Simplified Translations for Tests:** The mocking strategy for `useTranslation` and `Trans` provides direct and synchronous access to English translations from `en.json`, simplifying component testing by avoiding the full asynchronous nature of `i18next` in a real application.
        *   **English-Centric:** The setup is hardcoded for English, which is practical for most unit/integration tests focused on functionality rather than full localization testing.
        *   **Hybrid Approach (Mock + Real Init):** Mocking `react-i18next` for React components while still initializing the core `i18n` instance ensures that both components and any direct `i18n.t()` calls (if present in the codebase) function correctly with English translations in the test environment.
        *   **Maintenance for Namespaces:** The manual listing of namespaces in `resources` and `i18n.init` options needs to be kept in sync with the structure of `en.json`.*   **Internationalization Test Setup ([`src/tests/i18nTestSetup.ts`](src/tests/i18nTestSetup.ts:1)):**
    *   **Purpose:** Configures `i18next` and mocks `react-i18next` to provide a consistent and simple way to handle translations within the test environment, primarily focusing on English.
    *   **Key Features & Configurations:**
        *   **Imports ([`src/tests/i18nTestSetup.ts:1-3`](src/tests/i18nTestSetup.ts:1)):**
            *   `i18next` core library.
            *   `initReactI18next` from `react-i18next`.
            *   English translation JSON (`en.json`) from [`@/lib/i18n/locales/en.json`](lib/i18n/locales/en.json:1).
        *   **Resource Definition ([`src/tests/i18nTestSetup.ts:6-17`](src/tests/i18nTestSetup.ts:6)):**
            *   Loads the `en.json` content into the `resources` object for the 'en' language.
            *   The entire `en.json` is mapped to the default `translation` namespace.
            *   Top-level keys within `en.json` (e.g., `common`, `auth`, `profile`) are also explicitly mapped as individual namespaces.
        *   **`resolveKey` Helper ([`src/tests/i18nTestSetup.ts:20-23`](src/tests/i18nTestSetup.ts:20)):**
            *   A utility function that takes a dot-separated key (e.g., `auth.login.button`) and the `en.json` object.
            *   It attempts to resolve the nested key and returns the string value if found.
            *   If the key is not found or the value isn't a string, it returns the original key, mimicking `i18next`'s default fallback behavior.
        *   **`react-i18next` Mocking ([`src/tests/i18nTestSetup.ts:25-34`](src/tests/i18nTestSetup.ts:25)):**
            *   `vi.mock('react-i18next', ...)`: Mocks the `react-i18next` library.
            *   `useTranslation`: The hook is mocked to return a `t` function that uses `resolveKey` to directly look up translations from the imported `en.json` data.
            *   `Trans`: The component is mocked to also use `resolveKey` with its `i18nKey` prop, effectively rendering the translated string directly.
            *   `initReactI18next`: Mocked with a no-op `init` function to satisfy `i18n.use(initReactI18next)`.
        *   **`i18next` Instance Initialization ([`src/tests/i18nTestSetup.ts:36-44`](src/tests/i18nTestSetup.ts:36)):**
            *   Despite mocking `react-i18next`, the core `i18n` instance is still initialized using `i18n.use(initReactI18next).init(...)`.
            *   Configuration:
                *   `lng: 'en'`, `fallbackLng: 'en'`: Sets language and fallback to English.
                *   `resources`: Uses the defined English resources.
                *   `ns`: Declares all configured namespaces (e.g., 'translation', 'common', 'auth').
                *   `defaultNS: 'translation'`.
                *   `interpolation: { escapeValue: false }` (React handles escaping).
                *   `react: { useSuspense: false }` (disables Suspense for simpler testing).
        *   **Export ([`src/tests/i18nTestSetup.ts:46`](src/tests/i18nTestSetup.ts:46)):** Exports the configured `i18n` instance.
    *   **Observations & Recommendations:**
        *   **Simplified Translations for Tests:** The mocking strategy for `useTranslation` and `Trans` provides direct and synchronous access to English translations from `en.json`, simplifying component testing by avoiding the full asynchronous nature of `i18next` in a real application.
        *   **English-Centric:** The setup is hardcoded for English, which is practical for most unit/integration tests focused on functionality rather than full localization testing.
        *   **Hybrid Approach (Mock + Real Init):** Mocking `react-i18next` for React components while still initializing the core `i18n` instance ensures that both components and any direct `i18n.t()` calls (if present in the codebase) function correctly with English translations in the test environment.
        *   **Maintenance for Namespaces:** The manual listing of namespaces in `resources` and `i18n.init` options needs to be kept in sync with the structure of `en.json`.
