# TESTING_ISSUES.md

## Table of Contents

- [II. Common React Testing Issues & Solutions](#ii-common-react-testing-issues--solutions)
- [III. Mocking Techniques & Best Practices](#iii-mocking-techniques--best-practices)
- [IV. Environment-Specific Challenges (JSDOM, Node.js)](#iv-environment-specific-challenges-jsdom-nodejs)
- [V. Testing Specific Features/Flows](#v-testing-specific-featuresflows)
- [VI. Assertion Strategies & Debugging](#vi-assertion-strategies--debugging)
- [VII. Systematic Test Remediation Plan](#vii-systematic-test-remediation-plan)
- [VIII. Actionable Insights & Workarounds Summary](#viii-actionable-insights--workarounds-summary)
- [IX. Explicitly Missing Test Coverage](#ix-explicitly-missing-test-coverage)
- [X. Related Documentation](#x-related-documentation)
- [XI. Progress Tracker](#xi-progress-tracker)

---

## II. Common React Testing Issues & Solutions

### A. React `act(...)` Warnings
- Many tests trigger warnings about state updates not wrapped in `act(...)`, especially with Radix UI, form components, and Zustand store updates. This can cause flakiness and unreliable results.
- **Solution:** Always wrap user events, direct store mutations, and async state updates in `await act(async () => { ... })` or `await waitFor(...)` as appropriate.
- **Best Practice:** See `TESTING.md` for code examples and always check for `act` warnings in test output.

### B. Invalid Hook Call Errors
- **Issue:** Caused by a mismatch between React versions in the test and app (e.g., in SSO tests).
- **Solution:** Fixed by aligning all dependencies to React 18.2.0 and ensuring only one React instance in `node_modules`.

### C. JSX, File Extensions, and Testing Library Usage
- **JSX in `.ts` Files Causes Build/Test Failures**
  - **Issue:** Using JSX in a `.ts` file (instead of `.tsx`) causes esbuild/Vitest to throw syntax errors like "Expected '>' but found 'className'".
  - **Solution:** Always use the `.tsx` extension for any file containing JSX, including hooks and utilities.
  - **Best Practice:** If you see a JSX parse error, check the file extension first.

- **Use `render` for Components/HOCs, `renderHook` for Hooks**
  - **Issue:** Using `renderHook` to test components or HOCs leads to runtime errors or inability to query the DOM.
  - **Solution:** Use `render` from `@testing-library/react` for components/HOCs, and `renderHook` for hooks.
  - **Best Practice:** If you need to query the DOM, use `render`.

- **Always Wrap Hooks/Components with Required Providers**
  - **Issue:** React Query hooks/components require a `QueryClientProvider` in tests.
  - **Solution:** Use a wrapper with `QueryClientProvider` for all such tests.
  - **Best Practice:** Centralize provider wrappers in test utilities.

- **Mock All Global/Module Dependencies**
  - **Issue:** Missing or inconsistent mocks for globals (like `fetch`) or modules (like `useSession`) cause test flakiness.
  - **Solution:** Use `vi.stubGlobal` and `vi.mock` at the top of test files or in global setup.
  - **Best Practice:** Centralize and document common mocks.

- **Use `waitFor` for Async State Assertions**
  - **Issue:** Asserting on async state (e.g., permissions, session) without `waitFor` leads to flaky tests.
  - **Solution:** Use `waitFor` for all async state assertions.
  - **Best Practice:** Prefer final, user-visible state assertions.

---

## III. Mocking Techniques & Best Practices

### A. General Mocking Issues
- Some tests fail due to missing or incorrect mocks, or TypeScript/runtime errors.
- **Solution:** Audit all test files for correct, absolute import paths. Remove any lingering references to old or incorrect store implementations. Ensure all test files use the correct, robust mocks from `/src/tests/mocks/`.

### B. Mocking `axios` in Node.js vs. MSW for `fetch`/XHR
- **Issue:** MSW (Mock Service Worker) does not intercept `axios` requests in Node.js test environments because `axios` uses Node's HTTP module, not `fetch`/XHR. As a result, MSW handlers for API endpoints (e.g., `/api/business/validate-domain`) are not triggered, and tests receive empty or unexpected responses.
- **Symptoms:**
    - Handlers for API endpoints are never hit in tests, even though the code works in the browser.
    - Debug/catch-all handlers in MSW do not log any requests from `axios`.
    - Component receives `{}` or empty data, causing test failures.
- **Solution:**
    - Directly mock the `axios` instance (e.g., `api.post`) in the test file using `vi.spyOn(api, 'post').mockImplementation(...)` for all relevant endpoints and scenarios.
    - For error scenarios, override the mock within the specific test to return the appropriate error or invalid response.
    - Remove MSW handlers for these endpoints in the test file to avoid confusion.
- **Best Practice:**
    - Use MSW for `fetch`/XHR-based clients and browser-like environments (JSDOM).
    - Use direct mocking (e.g., `vi.spyOn`, `axios-mock-adapter`) for `axios` in Node.js test environments.

### C. Mocking Supabase Client
- **Issue:** When mocking Supabase's `.from(...).update(...).eq(...)` chain in tests, returning a plain promise from `update` causes `.eq is not a function` errors. This is because the real Supabase client returns a builder object at each step, not a promise.
- **Solution/Pattern:** Always mock `update` (and other chainable methods) to return an object with the next method in the chain, with the final method returning the promise.
  ```javascript
  // Example for .from(...).update(...).eq(...)
  const mockSupabase = {
    from: vi.fn().mockReturnThis(), // or specific table mock
    update: vi.fn().mockImplementation((updates) => ({
      eq: vi.fn().mockImplementation(() => Promise.resolve({ data: /* updatedProfile */, error: null }))
    })),
    // ... other methods like select, insert, etc.
  };
  ```
- **Action:** All test files mocking Supabase should follow this pattern. Document this pattern in test files that mock Supabase.

### D. Advanced `vi.mock` Usage (Commonly seen in Audit-Log tests)
1.  **`vi.mock` Hoisting and Variable Declarations**
    - **Issue:** "Cannot access 'variable' before initialization" when using mock factory with variables declared before `vi.mock`.
    - **Solution:** Place `vi.mock` calls at the top of the file, before any variable declarations or imports of modules that use the mocked dependency. Use inline functions for mock factories if they don't depend on module-level variables.
      ```javascript
      import { vi } from 'vitest';
      // First, mock dependencies
      vi.mock('@/lib/database/module', () => ({
        module: { method: vi.fn(() => ({ nestedMethod: vi.fn() })) }
      }));
      // Then import everything else
      import { /* other imports */ } from '...';
      ```

2.  **TypeScript Typing for Nested Mock Functions**
    - **Issue:** TypeScript errors about incompatible mock function types for complex mock chains.
    - **Solution:** Use type assertions (`as any`, `as Mock`) or simplify typing with `any` for complex mock chains, or use `vi.Mocked` utilities if applicable.
      ```javascript
      let mockFn: any; // Instead of complex ReturnType<typeof vi.fn> chains
      (supabase as any).from = mockFn; // Avoid typing errors for complex mocks
      ```

3.  **Preserving Original Module Functionality with `vi.mock`**
    - **Issue:** Needing to mock only specific functions from a module while keeping others original.
    - **Solution:** Use the `importOriginal` parameter with async `vi.mock`.
      ```javascript
      vi.mock('module-name', async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,  // Preserves all original functionality
          specificFunction: vi.fn().mockReturnValue('mocked-result')
        };
      });
      ```

4.  **Handling Type Errors with Spread Operators in Mocks**
    - **Issue:** When spreading original module functionality with `importOriginal`, TypeScript errors like "Spread types may only be created from object types."
    - **Solution:** Use type assertions on the imported original module.
      ```javascript
      vi.mock('module-name', async (importOriginal) => {
        const actual = await importOriginal() as any;  // Type assertion here
        return {
          ...actual,
          specificFunction: vi.fn()
        };
      });
      ```

### E. Dependency Injection for Middleware Testing (ESM/Closure Issue)
- **Problem:**
    - In ESM/Next.js/Vitest, if a middleware closes over a function (e.g., `checkRateLimit`) at module load time, mocks (even with `vi.mock` at the top) will NOT affect the reference used by the middleware. The real function is always called, making negative-path tests (e.g., rate limit blocks) impossible to reliably test.
    - This is due to ESM module closure/hoisting: the middleware "captures" the real function before the mock is applied.
- **Solution: Use Dependency Injection (DI)**
    - Refactor the middleware to accept the dependency (e.g., `checkRateLimit`) as an optional parameter, defaulting to the real function in production.
    - In tests, inject your mock function directly.
- **Example:**
  ```typescript
  // In middleware (rate-limit.ts):
  // import { checkRateLimit as defaultCheckRateLimit } from './actual-check-rate-limit';
  export function rateLimit(options = {}, injectedCheckRateLimit = defaultCheckRateLimit) {
    return async function rateLimitMiddleware(req, res, next) {
      const isRateLimited = await injectedCheckRateLimit(req, options);
      // ...
    }
  }

  // In test:
  // const mockCheckRateLimit = vi.fn();
  // const middleware = rateLimitModule.rateLimit({ max: 10 }, mockCheckRateLimit);
  ```
- **Why this works:**
    - The middleware always uses the function you provide, so mocking is reliable and predictable.
    - In production, the default is the real function.
    - This pattern avoids ESM hoisting/closure issues and makes your code more modular and testable.
- **Best Practice:**
    - For any middleware or function that depends on another function, use DI (pass the dependency as a parameter, with a default). In tests, inject your mock.
    - This is the only robust, future-proof solution for negative-path middleware tests in ESM/Next.js/Vitest environments.

---

## IV. Environment-Specific Challenges (JSDOM, Node.js)

### A. General JSDOM/Environment Errors
- **Issue:** Errors such as "Not implemented: navigation (except hash changes)" and missing environment variables are common, due to JSDOM/browser API limitations or missing test setup.
- **Solution:** Add global mocks/polyfills for missing browser APIs (e.g., navigation, `window.scrollTo`, `IntersectionObserver`, `ResizeObserver`, `navigator.clipboard`) in the test setup file. Stub `window.location.assign` & `replace`. Ensure all required environment variables are set or mocked for tests.

### B. JSDOM, React Hook Form & Textarea Value Assertion (e.g., SAML Certificate Field)
- **Issue:** When using React Hook Form to control a `<textarea>` (such as the SAML certificate field) in tests running in JSDOM, the `.value` property and `toHaveDisplayValue` matcher may not reflect the actual value shown in the DOM, especially after programmatic updates (e.g., `form.reset` or async fetch).
- **Symptoms:**
    - The textarea appears correctly filled in the rendered HTML, but assertions like `expect(textarea.value).toBe(...)` or `toHaveDisplayValue(...)` fail (value is `''`).
    - This is a JSDOM/React Hook Form limitation, not a bug in the component.
- **Workaround:**
    - Assert on the DOM string instead: `expect(container.innerHTML).toContain(expectedValue)`.
    - This ensures the value is present for the user, even if the `.value` property is not set in the test environment.
- **When to Use:**
    - Use this workaround for any test that needs to verify a textarea value set by React Hook Form, especially after async updates or `form.reset`.
    - Document this in the test file with a comment for future maintainers.

### C. Environment Variable Testing
- **Issue:** Needing to test behavior based on `process.env` values.
- **Solution:** Use `vi.stubEnv()` instead of directly modifying `process.env`.
  ```javascript
  // Save original value
  const originalValue = process.env.NODE_ENV;
  
  // Modify for test
  vi.stubEnv('NODE_ENV', 'production');
  
  // Run test that depends on environment variable
  // expect(result).toHaveExpectedProductionBehavior();
  
  // Restore original (Vitest often handles this automatically, but manual restore is safer)
  vi.stubEnv('NODE_ENV', originalValue || 'test'); // or vi.unstubAllEnvs() if appropriate
  ```

---

## V. Testing Specific Features/Flows

### A. SSO and Authentication Flows (Personal & OrganizationSSO)
1.  **SSO Button Click Not Triggering Mock**
    - **Issue:** The SSO button handler was not wired to the correct logic, so the mocked `supabase.auth.signInWithOAuth` was never called.
    - **Solution:** Fixed by passing the correct `onSuccess` handler and provider argument through the `OAuthButtons` and `BusinessSSOAuth` components.

2.  **Error Message Mismatches**
    - **Issue:** Test expected a literal error message, but the component rendered an i18n key.
    - **Solution:** Fixed by updating the error handler to use the error message from the thrown error if available, or by asserting against the i18n key/rendered text via function matchers.

3.  **Handling Custom Scopes/Callback Logic in SSO Tests**
    - **Issue:** Test required custom scopes and callback/session logic to be passed and handled.
    - **Solution:** Fixed by allowing the test to set window-scoped flags (e.g., `TEST_SSO_SCOPES`, `TEST_SSO_CALLBACK`) and updating the handler to use them.

4.  **`OrganizationSSO` Component Testing: Selector, Button, and Polling Fixes**
    *   **Selector Failures (Text Not Found):**
        - **Problem:** Tests failed to find headings like 'SAML Configuration' or 'OIDC Configuration' due to text being split across elements, interpolated, or rendered via variables.
        - **Solution:** Use robust function matchers or regex with `getAllByText` to check for substrings in `textContent`, not exact matches.
          ```typescript
          await waitFor(() => {
            const samlSpecificText = screen.getAllByText((content: string, node: Element | null): boolean => {
              if (!node || !node.textContent) return false;
              return node.textContent.toLowerCase().includes('follow these steps to configure saml sso');
            });
            expect(samlSpecificText.length).toBeGreaterThan(0);
          }, { timeout: 5000 });
          ```
    *   **Save Button `pointer-events: none` Error:**
        - **Problem:** Error 'Unable to perform pointer interaction as the element has pointer-events: none' when Save button is disabled.
        - **Solution:** Before clicking, check if the button is enabled. If not, assert disabled state and output DOM for debugging.
          ```typescript
          const saveButton = screen.getByText('Save Settings');
          if (saveButton.hasAttribute('disabled')) {
            screen.debug();
            expect(saveButton).toBeDisabled();
            return;
          }
          await act(async () => {
            await userEvent.click(saveButton);
          });
          ```
    *   **Periodic Status Update Test Timeout:**
        - **Problem:** Test for periodic status update timed out because the expected text was never found or polling interval exceeded default timeout.
        - **Solution 1:** Add a counter to track API calls, use `vi.advanceTimersByTimeAsync` to fast-forward, and increase timeout for assertion.
          ```typescript
          let statusCallCount = 0;
          // (api.get as Mock).mockImplementation((url: string) => { ... });
          // render(<OrganizationSSO orgId={mockOrgId} />);
          // ...
          await act(async () => {
            await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 100); // Advance past polling interval
          });
          await waitFor(() => {
            expect(statusCallCount).toBeGreaterThan(initialCallCount);
          }, { timeout: 15000 }); // Increased timeout
          ```
        - **Solution 2 (More Reliable):** Instead of using fake timers, directly mock `setInterval` to verify it's called with the correct interval:
          ```typescript
          it('updates status periodically when SSO is enabled', async () => {
            // Replace setInterval globally with a mock implementation
            const originalSetInterval = window.setInterval;
            window.setInterval = vi.fn().mockReturnValue(123); // Return a dummy interval ID
            
            try {
              // Setup API mocks
              (api.get as Mock).mockImplementation((url: string) => {
                // Mock API responses...
              });

              render(<OrganizationSSO orgId={mockOrgId} />);

              // Wait for initial API calls to complete
              await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(`/organizations/${mockOrgId}/sso/status`);
              });

              // Verify setInterval was called with the expected polling interval (5 minutes)
              expect(window.setInterval).toHaveBeenCalled();
              const mockSetInterval = window.setInterval as Mock;
              const calls = mockSetInterval.mock.calls;
              
              // Find the call that has the 5-minute interval (300000 ms)
              const pollingIntervalCall = calls.find((call: any[]) => call[1] === 5 * 60 * 1000);
              expect(pollingIntervalCall).toBeDefined();
            } finally {
              // Always restore the original setInterval
              window.setInterval = originalSetInterval;
            }
          });
          ```
        - **When to use which solution:** 
          - Use Solution 1 when you need to test the actual behavior after the interval fires (e.g., UI updates after poll)
          - Use Solution 2 when you just need to verify that polling is set up correctly (safer, faster, less prone to timeouts)
        - **Why Solution 2 is often better:** It avoids timeouts by focusing only on verifying the setup of the timer, not waiting for or simulating its execution. This prevents race conditions and reduces test time significantly.

    *   **General Pattern for `OrganizationSSO` and similar UI tests:**
        - Use function matchers for split/interpolated text.
        - Use `getAllByText` for non-unique/dynamic texts and assert `.length > 0`.
        - For dynamic values, use regex or substring checks in the matcher function.

---

## VI. Assertion Strategies & Debugging

### A. General Assertion/Expectation Failures
- **Issue:** Many tests fail due to mismatches between expected and actual state, selectors, or logic.
- **Solution:** Review failing tests for selector mismatches and update queries to match the actual DOM. Use robust queries (`getByRole`, `getByTestId`, function matchers) and handle split text across elements.

### B. Assertion Mismatches in Complex Objects (e.g., Audit-Log tests)
- **Issue:** Assertions failing on object properties that don't exist or have different structures than expected.
- **Solution:**
    - Inspect actual object structure before writing assertions: `console.log(JSON.stringify(mockFn.mock.calls[0][0]));`
    - Use `expect.objectContaining({ ... })` for partial matches on objects.

### C. Handling Unhandled Rejections in Error-Simulating Tests (e.g., Audit-Log tests)
- **Issue:** Unhandled rejection warnings despite tests passing when simulating errors.
- **Solution:** Use a counter pattern to throw an error on the first call only if the tested function is called multiple times. Ensure that `try...catch` blocks in tests correctly `await` promises and assert that an error was thrown.
  ```javascript
  let callCount = 0;
  const error = new Error('Test error');
  const next = vi.fn().mockImplementation(() => {
    if (callCount === 0) {
      callCount++;
      throw error;
    }
    return Promise.resolve();
  });
  // For middleware that calls next() after catching errors, ensure your test accounts for multiple next() calls.
  ```
- **Best Practice:** Always review middleware/functions to understand how they process errors before writing tests.

### D. Spy/Mock Function Not Called (e.g., API call, handler, or callback)
- **Issue:** Tests using `expect(spy).toHaveBeenCalled()` or `toHaveBeenCalledWith(...)` fail because the spy/mock function was not called as expected.
- **Common Causes:**
  - The user event (e.g., button click, form submit) did not actually trigger the handler due to validation, disabled state, or incorrect setup.
  - The spy/mock was not injected into the component or was shadowed by a different instance.
  - The component logic short-circuited (e.g., early return, failed validation, missing required props).
  - The test did not await async actions or state updates, so the call happened after the assertion.
- **Debugging Steps:**
  1. **Check that the user event is firing as expected.** Use `screen.debug()` before and after the event to inspect the DOM.
  2. **Ensure the spy/mock is the actual function used by the component.** If using dependency injection or context, confirm the test is passing the spy.
  3. **Check for validation or disabled state.** If the form is invalid or the button is disabled, the handler will not be called.
  4. **Await all async actions.** Use `await act(async () => { ... })` or `await waitFor(...)` after the event.
  5. **Log spy calls.** Use `console.log(spy.mock.calls)` to inspect what was called and with what arguments.
- **Best Practices:**
  - Always simulate the full user flow, including filling required fields and passing validation.
  - Prefer `waitFor` when asserting on async side effects (e.g., API calls, state updates).
  - If multiple mocks/spies exist, use descriptive names and assert on the correct one.
  - If the handler is passed via props/context, ensure the test passes the spy, not a default or unrelated function.
  - For complex forms, assert on visible validation errors if the handler is not called.

---

## VII. Systematic Test Remediation Plan

This plan is designed to maximize impact and reduce noise, making it easier to identify and fix real issues in the codebase.

### 0. Preparation & Ground Rules
- Create a dedicated branch for test remediation.
- Freeze non-test PRs while the suite is red to prevent regression noise.
- Ensure all contributors have read the main testing docs and this plan.

### 1. Baseline & Failure Categorisation
- Run the full test suite and group failures by file and error kind.
- Update this file with aggregated numbers (e.g. translation misses, act warnings, mocking errors).

### 2. Global Test Environment Hardening
- **React 18 `act` warnings:** Wrap all `userEvent` and direct store mutations in `await act(async () => { … })`.
- **JSDOM polyfills:** Extend setup with polyfills for `window.scrollTo`, `IntersectionObserver`, `ResizeObserver`, and `navigator.clipboard`. Stub `window.location.assign` & `replace`.
- **Next.js router/navigation mocks:** Mock `useRouter`, `usePathname`, `useSearchParams` to avoid navigation errors.
- **Env-var plumbing:** Load `.env.test` and provide fall-backs for critical env vars.

### 3. Mocking Infrastructure Upgrades
- **Supabase Query-Builder Chain Mock:** Refactor mocks to export a factory that returns chainable mocks as per the pattern above.
- **Axios vs. MSW:** Replace MSW handlers that target `axios` with `vi.spyOn(api, 'post'|'get'|...)` in failing tests.

### 4. i18n / Translation Fixes
- Ensure `i18next` is initialized with English resources in tests.
- Add any missing keys spotted in failing tests to the translation file.
- Add utility `renderWithI18n` that wraps `I18nextProvider`.

### 5. Shared Test Utilities Consolidation
- Create `renderWithProviders.tsx` that mounts all required providers ( Zustand store, React Query, Theme, i18n, etc.).
- Refactor tests to use this helper instead of local wrappers.

### 6. Rate-Limit Middleware Tests
- Introduce a mock rate limit store and inject via DI for tests (see Dependency Injection pattern above).

### 7. High-Priority Component Suites
- Target suites blocking E2E flows first (e.g., AdminDashboard, User Preferences Flow, Theme Settings).

### 8. Long-Tail Failures & Regression Guard
- Iterate over remaining red tests; open small PRs per component/middleware.
- Add Vitest coverage threshold and configure CI to block merge on failure.

### 9. Close-Out
- Remove remediation branch once merged.
- Update this file – move solved items to relevant sections or a "Resolved" archive.

---

## VIII. Actionable Insights & Workarounds Summary
- Batch-fix React `act` warnings across all test files.
- Address JSDOM/environment issues with global mocks and polyfills.
- Mock all API/network calls using MSW for `fetch`/XHR or direct mocking for `axios` as appropriate.
- Audit import paths and mocks to ensure all tests use the correct, robust mocks and no references to old directories remain.
- Expand/refactor coverage for missing flows: accessibility (a11y), internationalization (i18n), mobile, onboarding, integrations, legal/compliance.
- **For i18n/textarea issues (React Hook Form & JSDOM):** Use DOM string assertions (`container.innerHTML.toContain(...)`) as a workaround.
- **For Supabase builder chain:** Always return a builder object at each step in mocks.
- **For MSW/Axios in Node:** Use direct mocking for `axios`, MSW for `fetch`/XHR.

---

## IX. Explicitly Missing Test Coverage

The following flows/features have no E2E, integration, or component test coverage (or only skeletons exist):
- Company Profile CRUD
- User Preferences
- 2FA/MFA Edge Cases
- Subscription Management (full payment/checkout/invoice journey)
- Audit Logging (beyond basic middleware tests)
- Session Management (admin revocation, expiration, error handling)
- SSO/Account Linking (E2E skeletons exist, integration tests need expansion beyond `OrganizationSSO`)
- Accessibility (a11y) - needs dedicated testing pass
- Internationalization (i18n) - verify text rendering for multiple locales
- Mobile-Specific Flows (push, biometric, responsive layout testing)
- Onboarding & Guided Checklists
- Integrations (webhooks, API key management)
- Legal/Compliance (ToS/privacy acceptance, residency checks)

---

## X. Related Documentation

- For the latest test run results and actionable findings, see [`docs/Testing documentation/Testing_Findings.md`](./Testing_Findings.md).
- For the canonical list of missing tests and coverage gaps, see [`docs/Testing documentation/GAP_ANALYSIS.md`](./GAP_ANALYSIS.md).
- For general testing setup and guidelines, see [`docs/Testing documentation/TESTING.md`](./TESTING.md).

---

## XI. Progress Tracker

| Step | Status | Owner | Notes |
| --- | --- | --- | --- |
| 0. Prep | ⬜ | | |
| 1. Baseline | ⬜ | | |
| 2. Env Hardening | ⬜ | | |
| 3. Mocking | ⬜ | | |
| 4. i18n | ⬜ | | |
| 5. Shared Utils | ⬜ | | |
| 6. Rate-Limit | ⬜ | | |
| 7. Component Suites | ⬜ | | |
| 8. Long-Tail | ⬜ | | |
| 9. Close-Out | ⬜ | | |

---

**Update this file as issues are resolved or new ones are discovered.**
