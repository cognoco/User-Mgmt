# Test info

- Name: E2E: OAuth SSO Signup Flow >> should show error if essential info is missing (e.g., email)
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\sso-signup-oauth.e2e.test.ts:174:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /sign up with google/i })
    - waiting for" http://localhost:3000/signup" navigation to finish...
    - navigated to "http://localhost:3000/signup"

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\sso-signup-oauth.e2e.test.ts:194:24
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   94 |   test('should prompt to link account if email already exists', async ({ page }) => {
   95 |     const existingUserEmail = 'existing-user@example.com';
   96 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params like 'error', 'prompt') used for the email conflict/linking prompt
   97 |     const expectedErrorUrlPattern = /\/signup\?error=email_exists&prompt=link_account.*/i;
   98 |
   99 |     // --- START Test Specific User Setup ---
  100 |     // TODO: SETUP: Ensure user 'existing-user@example.com' DOES exist (e.g., created via password) before this test runs.
  101 |     // Example: await setupUser({ email: existingUserEmail, password: 'password123' });
  102 |     console.log(`SETUP Dependency: User ${existingUserEmail} MUST exist.`);
  103 |     // --- END Test Specific User Setup ---
  104 |
  105 |     // Mock the Google OAuth callback - simulates Google returning the existing email
  106 |     // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
  107 |     await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
  108 |       console.log(`Intercepted Google Callback (Email Exists): ${route.request().url()}`);
  109 |       // Simulate backend detecting email conflict and redirecting back with prompt
  110 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this conflict case
  111 |       const conflictRedirectUrl = `${SIGNUP_URL}?error=email_exists&prompt=link_account&email=${encodeURIComponent(existingUserEmail)}`;
  112 |       await route.fulfill({
  113 |         status: 302,
  114 |         headers: { Location: conflictRedirectUrl },
  115 |       });
  116 |     });
  117 |
  118 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
  119 |     const googleButton = page.getByRole('button', { name: /sign up with google/i });
  120 |     await googleButton.click();
  121 |
  122 |     // Wait for navigation back to the signup page with the specific error/prompt
  123 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
  124 |     await page.waitForURL(expectedErrorUrlPattern);
  125 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  126 |
  127 |     // Assert that a specific "email exists / link account" message is displayed
  128 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific prompt message element (e.g., role='alert')
  129 |     const promptMessage = page.getByRole('alert'); 
  130 |     await expect(promptMessage).toBeVisible();
  131 |     // TODO: VERIFY ERROR HANDLING: Verify the exact prompt message text displayed (suggesting linking)
  132 |     await expect(promptMessage).toContainText(/email already exists|account already exists|link your account/i);
  133 |     // Optionally, check for a button to link the account or log in normally
  134 |   });
  135 |
  136 |   test('should show error message if OAuth provider returns an error', async ({ page }) => {
  137 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used when the provider returns an error during signup
  138 |     const expectedErrorUrlPattern = /\/signup\?error=oauth_provider_error&provider=facebook.*/i;
  139 |
  140 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Facebook signup button
  141 |     const facebookButton = page.getByRole('button', { name: /sign up with facebook/i });
  142 |
  143 |     // Mock the Facebook OAuth callback - simulate the provider redirecting with an error
  144 |     // TODO: VERIFY URL/PATTERN: Verify the exact Facebook callback URL pattern used by your app
  145 |     await page.route(FACEBOOK_CALLBACK_PATTERN, async (route) => {
  146 |       const callbackUrlWithErrorFromProvider = route.request().url().split('?')[0] + '?error=access_denied&error_description=User+denied+access';
  147 |       console.log(`Simulating Provider Callback Failure URL: ${callbackUrlWithErrorFromProvider}`); 
  148 |
  149 |       // Simulate our backend processing this errored callback and redirecting to signup page
  150 |       console.log(`Intercepted Facebook Callback (Provider Error): ${route.request().url()}`);
  151 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this provider error case
  152 |       const appErrorRedirectUrl = `${SIGNUP_URL}?error=oauth_provider_error&provider=facebook&provider_error=access_denied`;
  153 |       await route.fulfill({
  154 |         status: 302,
  155 |         headers: { Location: appErrorRedirectUrl },
  156 |       });
  157 |     });
  158 |
  159 |     await facebookButton.click();
  160 |
  161 |     // Wait for navigation back to the signup page with the specific error
  162 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
  163 |     await page.waitForURL(expectedErrorUrlPattern);
  164 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  165 |
  166 |     // Assert that a specific error message is displayed
  167 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert')
  168 |     const errorMessage = page.getByRole('alert');
  169 |     await expect(errorMessage).toBeVisible();
  170 |     // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed for provider errors
  171 |     await expect(errorMessage).toContainText(/failed to sign up|access denied|provider error/i);
  172 |   });
  173 |
  174 |   test('should show error if essential info is missing (e.g., email)', async ({ page }) => {
  175 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used when required info (like email) is missing from provider
  176 |     const expectedErrorUrlPattern = /\/signup\?error=missing_required_info&field=email.*/i;
  177 |
  178 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
  179 |     const googleButton = page.getByRole('button', { name: /sign up with google/i });
  180 |
  181 |     // Mock the Google OAuth callback - successful auth, but backend finds email missing
  182 |     // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
  183 |     await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
  184 |       console.log(`Intercepted Google Callback (Missing Email): ${route.request().url()}`);
  185 |       // Simulate backend processing and finding email missing from provider data
  186 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this missing info case
  187 |       const missingInfoRedirectUrl = `${SIGNUP_URL}?error=missing_required_info&field=email`;
  188 |       await route.fulfill({
  189 |         status: 302,
  190 |         headers: { Location: missingInfoRedirectUrl },
  191 |       });
  192 |     });
  193 |
> 194 |     await googleButton.click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  195 |
  196 |     // Wait for navigation back to the signup page with the specific error
  197 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
  198 |     await page.waitForURL(expectedErrorUrlPattern);
  199 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  200 |
  201 |     // Assert that a specific error message is displayed
  202 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert')
  203 |     const errorMessage = page.getByRole('alert');
  204 |     await expect(errorMessage).toBeVisible();
  205 |     // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed for missing email/info
  206 |     await expect(errorMessage).toContainText(/email is required|missing required information/i);
  207 |   });
  208 | }); 
```