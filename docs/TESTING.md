# Testing Guide

This document provides instructions for running tests and understanding the test setup for the User Management module within the `project/` directory.

## Testing Framework

We use **Vitest** as our primary testing framework. The setup includes:

- Vitest (`vitest`) for test running and assertions.
- React Testing Library (`@testing-library/react`) for component testing.
- User Event (`@testing-library/user-event`) for simulating user interactions.
- JSDOM (`jsdom`) for providing a browser-like environment.
- MSW (`msw`) for mocking API requests (used in some tests).
- Testing Library Jest DOM (`@testing-library/jest-dom`) for additional DOM matchers.

## Running Tests

All test commands should be run from within the `project/` directory:

```bash
cd project

# Run all tests
npm test

# Run tests in watch mode
npm run test:ui  # Or vitest watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npm test -- path/to/test-file.test.tsx
```

View the coverage report by opening `project/coverage/lcov-report/index.html` after running the coverage command.

## Test Structure

Tests primarily reside within the component or module they are testing, using a `__tests__` subdirectory or a `.test.ts(x)` suffix:

```
project/
  └── src/
      ├── components/
      │   └── auth/
      │       ├── LoginForm.tsx
      │       └── __tests__/
      │           └── LoginForm.test.tsx
      └── lib/
          └── stores/
              ├── auth.store.ts
              └── __tests__/
                  └── auth.store.test.ts
```

Global test setup and mocks are configured in `project/src/test/setup.ts`.

## Component Mocking & Testing Best Practices

When mocking complex UI components (like Select, Switch, etc.), follow these guidelines to ensure reliable tests:

### 1. Mock Component Structure

- Create mocks that match the real component's DOM structure and accessibility attributes:
  ```typescript
  // Example: Mocking a Select component
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select-wrapper">
      <select 
        data-testid="select"
        role="combobox"  // Important for accessibility and queries
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={disabled}
      >
        {/* ... options ... */}
      </select>
    </div>
  )
  ```

### 2. Handle Component Composition

- For components that use composition (like Select with SelectItem children):
  - Create separate mock components for each part (SelectValue, SelectContent, SelectItem)
  - Use React's Children utilities to properly handle nested components:
  ```typescript
  const components = {
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectItem: ({ value, children }: any) => <div data-value={value}>{children}</div>,
  };
  
  // In the main component mock:
  const childArray = React.Children.toArray(children);
  const items = childArray.filter(child => 
    React.isValidElement(child) && child.type === components.SelectItem
  );
  ```

### 3. Translation Handling

- Mock translations with a mapping object for predictable text content:
  ```typescript
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => ({
        'component.save': 'Save',
        'component.saving': 'Saving...',
        // ... other translations
      })[key] || key,
    }),
  }));
  ```

### 4. State Management

- Wrap state changes in `act()` to ensure React updates complete:
  ```typescript
  await act(async () => {
    await userEvent.click(button);
  });
  ```
- Use `waitFor` for asynchronous state changes:
  ```typescript
  await waitFor(() => {
    expect(element).toHaveTextContent('expected text');
  });
  ```

### 5. Event Handling

- Use appropriate event simulation methods:
  - `userEvent.click()` for buttons and switches
  - `userEvent.selectOptions()` for select elements
  - Avoid direct event triggering when possible
- Add debug logging in mocks to help troubleshoot:
  ```typescript
  debug(`Select onChange called with ${e.target.value}`);
  ```

### 6. Testing Loading States

- Test both initial loading and action loading states
- Use appropriate selectors for loading indicators:
  ```typescript
  // For skeleton loaders
  expect(element.querySelector('.animate-pulse')).toBeInTheDocument();
  
  // For loading text
  expect(button).toHaveTextContent(/saving/i);
  ```

### 7. Error Handling

- Test error states and error clearing
- Use appropriate test IDs and roles for error messages:
  ```typescript
  expect(screen.getByTestId('alert')).toHaveTextContent('error message');
  expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  ```

### 8. Data Format Consistency

- Ensure mock data matches the exact format expected by the component:
  ```typescript
  // ❌ Wrong format
  { enabled: true, idpType: 'SAML' }
  
  // ✅ Correct format (matches API/component contract)
  { sso_enabled: true, idp_type: 'saml' }
  ```
- Pay attention to:
  - Property names (snake_case vs camelCase)
  - Value formats (uppercase vs lowercase)
  - Null values vs undefined
  - Optional properties

### 9. Debugging Test Failures

When tests fail, follow this debugging checklist:

1. **Component Structure Mismatch**
   ```typescript
   // ❌ Invalid nesting
   <option>
     <div>Option Text</div>
   </option>

   // ✅ Valid HTML structure
   <select>
     <option>Option Text</option>
   </select>
   ```

2. **Translation Keys vs Actual Text**
   ```typescript
   // ❌ Looking for translated text when using key
   expect(element).toHaveTextContent('Save');  // Fails
   ```

### 10. Testing React Hook Form Validation

When testing forms using React Hook Form, consider these best practices:

1.  **Validation Mode & Interaction:**
    *   **Crucial:** Align test interactions with the form's `validationMode` (`onChange`, `onSubmit`, etc.).
    *   For `onChange` mode, simulate user interactions (`userEvent.type`, `userEvent.clear`, `userEvent.tab`) to trigger validation for specific fields.
    *   **Avoid** relying on clicking the submit button on an initially invalid form to check for required field errors, as the button may be disabled by the form library, preventing the necessary events.
    ```typescript
    // ✅ Trigger validation through user interaction for 'onChange' mode
    await user.type(emailInput, 'invalid');
    await user.tab(); // Or blur
    await waitFor(() => { 
      expect(screen.getByText(/valid email/i)).toBeInTheDocument(); 
    });
    ```

2.  **Validation Timing:**
    *   Use `waitFor` after triggering interactions to reliably check for the appearance (or disappearance) of validation messages or state changes.

3.  **Form State & Assertions:**
    *   **Prefer asserting on user-visible outcomes:** Check for the presence/absence of specific error message text using `screen.getByText` / `screen.queryByText`.
    *   Avoid relying solely on implementation details like specific CSS classes (`.valid-input`) or ARIA attributes (`aria-describedby`, unless specifically testing accessibility patterns) as these can be brittle.
    *   Checking `aria-invalid` state can still be useful: `expect(input).toHaveAttribute('aria-invalid', 'true');`

4.  **User Interaction:**
    *   Use `userEvent` over `fireEvent`.
    *   Simulate realistic user flows.

### 11. Mocking Chained Asynchronous Methods (e.g., Supabase Client)

- When mocking libraries that use method chaining ending in a promise (like `supabase.from(...).select(...).eq(...).single()`), ensure your mock reflects the *entire chain* called by the component.
  ```typescript
  // Example: Mocking supabase.from('table').select().eq().single()
  vi.mock('@/lib/supabase', () => {
    const mockSingle = vi.fn(); // Mock the final method that resolves
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    return {
      supabase: {
        from: mockFrom,
        // ... other mocks like auth ...
      }
    };
  });
  
  // In the test:
  const itemsBuilder = supabase.from('items'); // Not directly useful anymore
  // Need to access the final mock in the chain to set its resolution
  let mockSingleInstance: Mock;
  if (/* ... checks to ensure mock is set up ... */) {
      mockSingleInstance = supabase.from('items').select().eq('id', 'dummy').single as Mock;
  }
  mockSingleInstance.mockResolvedValueOnce({ data: ..., error: null });
  ```
- Mock only as much of the chain as the component actually uses.

### 12. Testing Components Dependent on Context Providers (e.g., `UserManagementProvider`)

- **Problem:** Mocking context hooks (like `useUserManagement`) directly using `vi.mock` or manual mock files can be unreliable and complex due to Vitest's module hoisting, potential test pollution, or interference with global mocks. Tests may fail because the component receives the default context value instead of the intended mock.
- **Recommended Solution:** **Avoid mocking the context hook.** Instead:
    1. Use the **actual Provider component** (e.g., `<UserManagementProvider>`) when rendering the component under test.
    2. If a test requires specific, non-default context values, define a configuration object (`testConfig`) within that specific test.
    3. Pass this configuration directly to the real provider via its props: `<UserManagementProvider config={testConfig}><YourComponent /></UserManagementProvider>`.
- **Benefits:** This leverages the real context mechanism, ensures reliable context values for the component, and avoids brittle hook mocking.
- **Example:** See `src/tests/integration/form-validation-errors.test.tsx` - `Validates complex form with dependent fields` test.

### 13. Testing Interactive UI (Popovers, Modals, etc.)

- For components that reveal content upon interaction (e.g., clicking a button to open a Popover):
  1.  **Render** the component.
  2.  **Wait for Trigger:** Use `screen.getByRole` (or other queries) to find the trigger element and assert it's present/enabled.
  3.  **Simulate Interaction:** Use `userEvent.click` (or other appropriate event) on the trigger.
  4.  **Wait for Content:** Use `waitFor` and queries (`getByText`, `getByTestId`, etc.) to find elements *inside* the newly revealed content *before* making assertions about them or interacting further.

## Test Coverage Areas

Tests should aim to cover:

-   Core authentication logic (login, register, logout, password handling).
-   Profile fetching and updating.
-   Settings management.
-   Component rendering based on different states (loading, error, success, auth status).
-   Form validation and submission.
-   API route handlers (input validation, authentication, responses).

## Known Issues

Refer to `docs/TESTING_ISSUES.md` for details on known test failures (like timeouts) and the plan to address them.

**Summary of Current Status (As of Migration Completion):**

*   **Empty Test Suite:**
    *   `AuthComponent.example.test.tsx` > `AuthTestComponent with helper function` fails with "No test found in suite". This suite needs test cases added or removed.
*   **Test Timeouts:**
    *   `RegistrationForm.test.tsx`: Two tests (`shows success message...` and `shows API error message...`) consistently time out, even with increased duration (30s).
    *   **Cause:** This appears related to the heavy mocking of `react-hook-form` (`useForm`) within the test file. The state updates (`setApiSuccess`, `setApiError`) within the component after the mocked submission resolves are not reliably triggering UI updates (rendering the Alert) that `screen.findByText` can detect before the timeout.
    *   **Recommendation:** Refactor these two tests to **remove the mocking of `useForm`**. Instead, use `@testing-library/user-event` to simulate user interactions (typing into inputs, clicking checkbox/submit button). This will provide a more realistic test of the component's behavior.
*   **React Warnings:**
    *   `LoginForm.test.tsx`: A remaining `ref` warning (`Function components cannot be given refs... Check the render method of LoginForm`). This needs further investigation to identify which element/mock is causing it.

## General Mocking Strategy & Environment Considerations

- **Minimize Deep Mocks:** Where possible, avoid mocking the internal implementation details of libraries (like `react-hook-form` internals). Prefer testing with the real library controlled via props and simulated user interactions.
- **Mock Boundaries:** Focus mocks on external dependencies (API calls, Stores, third-party SDKs).
- **Global Mocks (`vitest.setup.ts`):** Be aware that extensive global mocks can sometimes interfere with manual mocks or `vi.mock` calls within test files. If a specific mock isn't applying as expected, consider potential conflicts with global setup and test pollution. Using configuration props (as described for context providers) can sometimes bypass these issues.
- **Test Isolation:** Ensure proper cleanup between tests using `beforeEach` with `vi.clearAllMocks()` and specific mock resets (`mockFn.mockClear()`) to prevent state leakage.

## Synchronizing Tests After Refactoring

- **Crucial:** When refactoring component props (e.g., changing from `itemId` fetch to accepting `itemData`) or internal logic, **immediately update the corresponding test files**.
- Mismatched tests (e.g., tests passing props the component no longer accepts, or tests mocking internal behavior that no longer exists) are a common source of failures.

## Handling `act(...)` Warnings

- You might encounter `act(...)` warnings when testing components using third-party UI libraries (like Radix UI), especially those involving animations, portals, or complex state updates.
- **Cause:** Asynchronous updates within the library might not be automatically wrapped in `act` by React Testing Library.
- **Action:**
  - Check if the warnings correlate with actual test failures or flakiness. Often, they don't if the test correctly waits for and asserts on the final state.
  - If needed, try wrapping the specific user interaction that triggers the warning in `act(async () => { await userEvent.click(...) })`.
  - Consult the UI library's documentation for specific testing guidance.
  - If tests pass reliably despite warnings, you can note them in `TESTING_ISSUES.md` and monitor.

## Continuous Integration

Tests are expected to run in CI pipelines. Pull requests should ideally maintain or increase test coverage and pass all tests.

## Common Testing Pitfalls and Best Practices

### 1. Error Handling for API Responses
- Always check for both `error` and `message` fields in API error responses, as backend conventions may vary.
- Handle non-200 status codes gracefully in both component logic and tests. Axios will throw for 4xx/5xx responses, so ensure your error handling logic extracts the correct message for the user and for test assertions.
- Surface backend error messages to the user (and thus to tests) for a better user experience and more robust test coverage.
- Example: In `ProfileTypeConversion`, the error handler was updated to check for both `error` and `message` fields, and to distinguish between validation and general errors based on status code and response shape.

### 2. MSW Handler URL Matching
- MSW handlers must match the *full* request URL, including the baseURL set in your API client (e.g., Axios). If the handler path does not match, requests will go unhandled and tests will fail (often with 404s or MSW 'unhandled request' errors).
- Debug by logging both the actual request URL (in your Axios interceptor) and the MSW handler path.
- Example: In the ProfileTypeConversion tests, handlers were updated to use the real `apiConfig.baseUrl` to match the Axios client.

### 3. TypeScript Type Drift
- When adding new fields to your data model (e.g., `businessId`), always update your TypeScript types/interfaces to match. Type errors will occur if you pass unknown fields to functions like `updateProfile`.
- Regularly review and sync types with backend changes.

### 4. UI Library Mocking
- When mocking UI components (e.g., Radix Select), ensure your mocks are accessible and compatible with user-event and React Testing Library. This includes passing the correct `id`, `name`, and label associations so that `getByLabelText` and `selectOptions` work as expected.
- Example: The Select mock in ProfileTypeConversion tests was updated to extract the `id` from the trigger and render a native `<select>` for accessibility.

### 5. General Advice
- If a test fails due to a network or API error, check both your MSW handlers and your error handling logic.
- If a test fails due to a type error, check your TypeScript types and update them as needed.
- Document any new patterns or gotchas you encounter to help future contributors.

## Playwright E2E Selector Best Practices

- When writing Playwright E2E tests for custom UI components (such as Checkbox), **do not assume standard HTML attributes like `name` are present**.
- Instead, use a robust selector such as a `data-testid` or `id` attribute that is present on the component.
- For example, in the RegistrationForm, the terms and conditions checkbox uses `data-testid="accept-terms-checkbox"`:

  ```js
  await page.check('[data-testid="accept-terms-checkbox"]');
  ```

- Always inspect the rendered HTML or React component code to confirm the correct selector for Playwright tests. 