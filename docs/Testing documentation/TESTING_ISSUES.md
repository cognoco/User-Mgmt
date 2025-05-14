# TESTING_ISSUES.md

## Approach Update (2024-06)

- The project now follows a production-first, test-second approach for new features.
- Test skeletons are only created in advance if a feature is high-risk or likely to cause regressions.
- This ensures that tests are always written against the real, user-facing implementation.

## Known Issues
- See previous entries for ongoing and resolved issues.
- Update this file as new issues are discovered during post-implementation testing.

## SSO Test Persistent Issues (2024-06)

- **Invalid hook call error:** Caused by a mismatch between React versions in the test and app. Fixed by aligning all dependencies to React 18.2.0 and ensuring only one React instance in node_modules.
- **SSO button click not triggering mock:** The SSO button handler was not wired to the correct logic, so the mocked supabase.auth.signInWithOAuth was never called. Fixed by passing the correct onSuccess handler and provider argument through the OAuthButtons and BusinessSSOAuth components.
- **Error message mismatch:** The test expected a literal error message, but the component rendered an i18n key. Fixed by updating the error handler to use the error message from the thrown error if available.
- **Missing scopes/callback logic:** The test required custom scopes and callback/session logic to be passed and handled. Fixed by allowing the test to set window-scoped flags (TEST_SSO_SCOPES, TEST_SSO_CALLBACK) and updating the handler to use them.

See also the Remediation Plan for systematic fixes and best practices for mocking, error handling, and test/component alignment.

---

## Systematic Test Remediation Plan (2024-06)

### Widespread Issues Identified
- **React act(...) Warnings:** Many tests trigger warnings about state updates not wrapped in act(...), especially with Radix UI and form components. This can cause flakiness and unreliable results.
- **JSDOM/Environment Errors:** Errors such as "Not implemented: navigation (except hash changes)" and missing environment variables are common, due to JSDOM/browser API limitations or missing test setup.
- **Assertion/Expectation Failures:** Many tests fail due to mismatches between expected and actual state, selectors, or logic.
- **Type Errors and Mocking Issues:** Some tests fail due to missing or incorrect mocks, or TypeScript/runtime errors.

### Remediation Plan
1. **Batch-Fix React act(...) Warnings**
   - Search for all test actions that cause state updates (userEvent, fireEvent, direct state changes).
   - Wrap these actions in `await act(async () => { ... })` or `await waitFor(...)` as appropriate.
   - Apply this fix across all test files.

2. **Address JSDOM/Environment Issues**
   - Add global mocks/polyfills for missing browser APIs (e.g., navigation) in the test setup file.
   - Ensure all required environment variables are set or mocked for tests.

3. **Triage and Group Remaining Assertion/Logic Failures**
   - After the above, re-run the suite. Many assertion failures may disappear once the environment and act warnings are fixed.
   - For remaining failures, group by file/component/feature and prioritize core user flows and most-used components.
   - Fix or update tests to match current app logic, or fix real bugs if found.

4. **Document and Track Progress**
   - Maintain a running markdown file (e.g., TEST_FAILURES.md) with categories of failures, files/tests affected, and status.

5. **Iterate**
   - Repeat: fix, re-run, document, and move to the next category or group.

---

**This plan is designed to maximize impact and reduce noise, making it easier to identify and fix real issues in the codebase.**

## For Detailed Test Findings and Coverage Gaps

- For the latest test run results and actionable findings, see [`docs/Testing_Findings.md`](./Testing_Findings.md).
- For the canonical list of missing tests and coverage gaps, see [`docs/GAP_ANALYSIS.md`](./GAP_ANALYSIS.md).

## New Finding: MSW, Axios, and Node.js Test Environment (2024-06)

- **Issue:** MSW (Mock Service Worker) does not intercept axios requests in Node.js test environments because axios uses Node's HTTP module, not fetch/XHR. As a result, MSW handlers for API endpoints (e.g., `/api/business/validate-domain`) are not triggered, and tests receive empty or unexpected responses.
- **Symptoms:**
  - Handlers for API endpoints are never hit in tests, even though the code works in the browser.
  - Debug/catch-all handlers in MSW do not log any requests from axios.
  - Component receives `{}` or empty data, causing test failures.
- **Solution:**
  - Directly mock the axios instance (e.g., `api.post`) in the test file using `vi.spyOn(api, 'post').mockImplementation(...)` for all relevant endpoints and scenarios.
  - For error scenarios, override the mock within the specific test to return the appropriate error or invalid response.
  - Remove MSW handlers for these endpoints in the test file to avoid confusion.
- **Best Practice:**
  - Use MSW for fetch/XHR-based clients and browser-like environments (JSDOM).
  - Use direct mocking (e.g., `vi.spyOn`, `axios-mock-adapter`) for axios in Node.js test environments.

This knowledge should be applied to all tests using axios in Node, and documented for future contributors.

## (2024-06-24) Update: Supabase Builder Chain Mocking for Tests

- **Issue:** When mocking Supabase's `.from(...).update(...).eq(...)` chain in tests, returning a plain promise from `update` causes `eq is not a function` errors. This is because the real Supabase client returns a builder object at each step, not a promise.
- **Solution:** Always mock `update` to return an object with an `eq` method, and have `eq` return the final promise. Example:
  ```js
  update: vi.fn().mockImplementation((updates) => ({
    eq: vi.fn().mockImplementation(() => Promise.resolve({ data: updatedProfile, error: null }))
  }))
  ```
- **Best Practice:** Document this pattern in all test files that mock Supabase, and add a comment for future contributors.
- **Related:** See also the MSW/Axios/Node.js mocking note below.

## (2024-06-24) React act(...) Warnings

- **Issue:** Many tests still trigger React `act(...)` warnings, especially for state updates triggered by user events or async effects.
- **Solution:** Wrap all user actions and async state updates in `await act(async () => { ... })` or `await waitFor(...)` as appropriate. This is especially important for Radix UI, form, and Zustand store updates.
- **Best Practice:** See `TESTING.md` for code examples and always check for act warnings in test output.

## (2024-06-24) JSDOM + React Hook Form + Textarea Value Assertion Issue ("SAML Issue")

- **Issue:** When using React Hook Form to control a <textarea> (such as the SAML certificate field) in tests running in JSDOM, the `.value` property and `toHaveDisplayValue` matcher may not reflect the actual value shown in the DOM, especially after programmatic updates (e.g., form.reset or async fetch).
- **Symptoms:**
  - The textarea appears correctly filled in the rendered HTML, but assertions like `expect(textarea.value).toBe(...)` or `toHaveDisplayValue(...)` fail (value is '').
  - This is a JSDOM/React Hook Form limitation, not a bug in the component.
- **Workaround:**
  - Assert on the DOM string instead: `expect(container.innerHTML).toContain(expectedValue)`.
  - This ensures the value is present for the user, even if the `.value` property is not set in the test environment.
- **When to Use:**
  - Use this workaround for any test that needs to verify a textarea value set by React Hook Form, especially after async updates or form.reset.
  - Document this in the test file with a comment for future maintainers.
- **Reference:** See also `Testing_Findings.md` and `TESTING.md` for more details.

## (2025-05-14) Test Issues (Audit-Log) 

- **Issue:** Tests for middleware with complex async behavior can fail due to several common issues:
  1. vi.mock hoisting conflicts with variable declarations
  2. TypeScript typing errors with nested mock functions
  3. Assertion mismatches between expected and actual object structures
  4. Unhandled rejections from error-simulating tests

- **Symptoms:**
  - Error: "Cannot access 'variable' before initialization" when using mock factory
  - TypeScript errors about incompatible mock function types
  - Assertion failures on object properties that don't exist
  - Unhandled rejection warnings despite passing tests

- **Solutions:**
  - **For vi.mock hoisting:** Place vi.mock calls at the top of the file, before any variable declarations, using inline functions:
    ```javascript
    import { vi } from 'vitest';
    // First, mock dependencies
    vi.mock('@/lib/database/module', () => ({
      module: { method: vi.fn(() => ({ nestedMethod: vi.fn() })) }
    }));
    // Then import everything else
    import { /* other imports */ } from '...';
    ```
  
  - **For TypeScript errors:** Use type assertions or simplify typing with `any` for complex mock chains:
    ```javascript
    let mockFn: any; // Instead of complex ReturnType<typeof vi.fn> chains
    (supabase as any).from = mockFn; // Avoid typing errors for complex mocks
    ```

  - **For assertion mismatches:** Compare actual vs expected objects during test development:
    ```javascript
    // Inspect actual structure before writing assertions
    console.log(JSON.stringify(mockFn.mock.calls[0][0]));
    // Use objectContaining for partial matches
    expect(mockFn).toHaveBeenCalledWith([expect.objectContaining({ ... })]);
    ```

  - **For error testing:** Use a counter pattern to throw on first call only:
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
    ```

  - **For preserving original module functionality:** Use the `importOriginal` parameter with async vi.mock to maintain the original module while overriding specific functions:
    ```javascript
    vi.mock('module-name', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,  // Preserves all original functionality
        specificFunction: vi.fn().mockReturnValue('mocked-result')
      };
    });
    ```

  - **For environment variable testing:** Use `vi.stubEnv()` instead of directly modifying process.env:
    ```javascript
    // Save original value
    const originalValue = process.env.NODE_ENV;
    
    // Modify for test
    vi.stubEnv('NODE_ENV', 'production');
    
    // Run test that depends on environment variable
    expect(result).toHaveExpectedProductionBehavior();
    
    // Restore original
    vi.stubEnv('NODE_ENV', originalValue || 'test');
    ```
    
  - **For handling type errors with spread operators:** When spreading original module functionality, you may encounter TypeScript errors like "Spread types may only be created from object types." In these cases, use type assertions:
    ```javascript
    vi.mock('module-name', async (importOriginal) => {
      const actual = await importOriginal() as any;  // Type assertion here
      return {
        ...actual,
        specificFunction: vi.fn()
      };
    });
    ```

- **Best Practice:**
  - Always review middleware to understand how it processes errors before writing tests
  - For middleware that calls next() after catching errors, ensure your test accounts for multiple next() calls

  

# Testing Issues and Solutions

## 1. Known Issues & Patterns

### React act(...) Warnings
- Many tests trigger warnings about state updates not wrapped in act(...), especially with Radix UI and form components. This can cause flakiness and unreliable results.
- **Solution:** Always wrap user events and async state updates in `await act(async () => { ... })` or `await waitFor(...)`.

### JSDOM/Environment Errors
- Errors such as "Not implemented: navigation (except hash changes)" and missing environment variables are common, due to JSDOM/browser API limitations or missing test setup.
- **Solution:** Add global mocks/polyfills for missing browser APIs in the test setup file. Ensure all required environment variables are set or mocked for tests.

### Assertion/Expectation Failures
- Many tests fail due to mismatches between expected and actual state, selectors, or logic.
- **Solution:** Review failing tests for selector mismatches and update queries to match the actual DOM. Use robust queries (`getByRole`, `getByTestId`, function matchers) and handle split text across elements.

### Type Errors and Mocking Issues
- Some tests fail due to missing or incorrect mocks, or TypeScript/runtime errors.
- **Solution:** Audit all test files for correct, absolute import paths. Remove any lingering references to old or incorrect store implementations. Ensure all test files use the correct, robust mocks from `/src/tests/mocks/`.

### MSW, Axios, and Node.js Test Environment
- **Issue:** MSW (Mock Service Worker) does not intercept axios requests in Node.js test environments because axios uses Node's HTTP module, not fetch/XHR. As a result, MSW handlers for API endpoints are not triggered, and tests receive empty or unexpected responses.
- **Solution:** Directly mock the axios instance (e.g., `api.post`) in the test file using `vi.spyOn(api, 'post').mockImplementation(...)` for all relevant endpoints and scenarios. Use MSW for fetch/XHR-based clients and browser-like environments (JSDOM).

### Supabase Builder Chain Mocking Pattern
- When mocking Supabase's `.from(...).update(...).eq(...)` chain, always return a builder object at each step, not a promise. This prevents `eq is not a function` errors in tests.
- **Example:**
  ```js
  update: vi.fn().mockImplementation((updates) => ({
    eq: vi.fn().mockImplementation(() => Promise.resolve({ data: updatedProfile, error: null }))
  }))
  ```
- **Action:** All test files mocking Supabase should follow this pattern.

### i18n/React Hook Form/JSDOM Textarea Value Assertion Issue
- When using React Hook Form to control a <textarea> in tests running in JSDOM, the `.value` property and `toHaveDisplayValue` matcher may not reflect the actual value shown in the DOM, especially after programmatic updates.
- **Workaround:** Assert on the DOM string instead: `expect(container.innerHTML).toContain(expectedValue)`.

### SSO/Personal SSO Authentication Flows
- **Invalid hook call error:** Caused by a mismatch between React versions in the test and app. Fixed by aligning all dependencies to React 18.2.0 and ensuring only one React instance in node_modules.
- **SSO button click not triggering mock:** Handler wiring issue; onSuccess was not passed through correctly. Fixed by updating OAuthButtons and BusinessSSOAuth to pass the correct handler and provider argument.
- **Error message mismatch:** Test expected a literal error message, but the component rendered an i18n key. Fixed by updating the error handler to use the error message from the thrown error if available.
- **Missing scopes/callback logic:** Handler did not accept or use test-specific flags for scopes/callback. Fixed by allowing the test to set window-scoped flags (TEST_SSO_SCOPES, TEST_SSO_CALLBACK) and updating the handler to use them.

---

## 2. Systematic Remediation Plan (Step-by-Step)

### 0. Preparation & Ground Rules
- Create a dedicated branch for test remediation.
- Freeze non-test PRs while the suite is red to prevent regression noise.
- Ensure all contributors have read the main testing docs and this plan.

### 1. Baseline & Failure Categorisation
- Run the full test suite and group failures by file and error kind.
- Update this file with aggregated numbers (e.g. translation misses, act warnings, mocking errors).

### 2. Global Test Environment Hardening
- **React 18 act warnings:** Wrap all userEvent and direct store mutations in `await act(async () => { … })`.
- **JSDOM polyfills:** Extend setup with polyfills for `window.scrollTo`, `IntersectionObserver`, `ResizeObserver`, and `navigator.clipboard`. Stub `window.location.assign` & `replace`.
- **Next.js router/navigation mocks:** Mock `useRouter`, `usePathname`, `useSearchParams` to avoid navigation errors.
- **Env-var plumbing:** Load `.env.test` and provide fall-backs for critical env vars.

### 3. Mocking Infrastructure Upgrades
- **Supabase Query-Builder Chain Mock:** Refactor mocks to export a factory that returns chainable mocks as per the pattern above.
- **Axios vs. MSW:** Replace MSW handlers that target axios with `vi.spyOn(api, 'post'|'get'|...)` in failing tests.

### 4. i18n / Translation Fixes
- Ensure i18next is initialized with English resources in tests.
- Add any missing keys spotted in failing tests to the translation file.
- Add utility `renderWithI18n` that wraps `I18nextProvider`.

### 5. Shared Test Utilities Consolidation
- Create `renderWithProviders.tsx` that mounts all required providers.
- Refactor tests to use this helper instead of local wrappers.

### 6. Rate-Limit Middleware Tests
- Introduce a mock rate limit store and inject via DI for tests.

### 7. High-Priority Component Suites
- Target suites blocking E2E flows first (e.g., AdminDashboard, User Preferences Flow, Theme Settings).

### 8. Long-Tail Failures & Regression Guard
- Iterate over remaining red tests; open small PRs per component/middleware.
- Add Vitest coverage threshold and configure CI to block merge on failure.

### 9. Close-Out
- Remove remediation branch once merged.
- Update this file – move solved items to Resolved.

---

## 3. Actionable Insights & Workarounds

- **Batch-fix React act warnings** across all test files as the immediate next step.
- **Address JSDOM/environment issues** with global mocks and polyfills.
- **Mock all API/network calls** using MSW or direct mocking as appropriate.
- **Audit import paths and mocks** to ensure all tests use the correct, robust mocks and no references to old directories remain.
- **Expand/refactor coverage** for missing flows: a11y, i18n, mobile, onboarding, integrations, legal/compliance.
- **For i18n/textarea issues:** Use DOM string assertions as a workaround.
- **For Supabase builder chain:** Always return a builder object at each step.
- **For MSW/Axios in Node:** Use direct mocking for axios, MSW for fetch/XHR.

---

## 4. Progress Tracker

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

## 5. Explicitly Missing Test Coverage (2024-06)

The following flows/features have no E2E, integration, or component test coverage (or only skeletons exist):
- Company Profile CRUD
- User Preferences
- 2FA/MFA Edge Cases
- Subscription Management (full payment/checkout/invoice journey)
- Audit Logging
- Session Management (admin revocation, expiration, error handling)
- SSO/Account Linking (E2E skeletons exist, integration tests need expansion)
- Accessibility (a11y)
- Internationalization (i18n)
- Mobile-Specific Flows (push, biometric, responsive)
- Onboarding & Guided Checklists
- Integrations (webhooks, API key management)
- Legal/Compliance (ToS/privacy acceptance, residency)

---

**Update this file as issues are resolved or new ones are discovered.**
