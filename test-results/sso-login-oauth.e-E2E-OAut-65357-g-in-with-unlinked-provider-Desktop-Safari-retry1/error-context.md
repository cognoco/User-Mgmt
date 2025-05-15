# Test info

- Name: E2E: OAuth SSO Login Flow >> should show error message if user tries to log in with unlinked provider
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\sso-login-oauth.e.test.ts:122:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /facebook/i })

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\sso-login-oauth.e.test.ts:144:26
```

# Page snapshot

```yaml
- heading "Welcome Back" [level=1]
- heading "Sign in to your account" [level=2]
- paragraph: Enter your email below to sign in to your account
- button "G Sign in with Google"
- button "A Sign in with Apple"
- button "GH Sign in with GitHub"
- text: or Or continue with Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Show password"
- checkbox "Remember me"
- text: Remember me
- button "Login"
- text: Don't have an account?
- link "Sign up":
  - /url: /auth/register
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   44 |     const googleButton = page.getByRole('button', { name: /google/i });
   45 |     const githubButton = page.getByRole('button', { name: /github/i });
   46 |     // Add other providers as needed
   47 |
   48 |     await expect(googleButton).toBeVisible();
   49 |     await expect(githubButton).toBeVisible();
   50 |   });
   51 |
   52 |   test('should redirect to OAuth provider for login (e.g., Google)', async ({ page }) => {
   53 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Google login button
   54 |     const googleButton = page.getByRole('button', { name: /google/i });
   55 |
   56 |     await googleButton.click();
   57 |
   58 |     // TODO: VERIFY URL/PATTERN: Verify the exact URL pattern for Google's OAuth consent/login screen
   59 |     const expectedGoogleUrlPattern = /^https:\/\/accounts\.google\.com\/.*/;
   60 |     await page.waitForURL(expectedGoogleUrlPattern);
   61 |     await expect(page).toHaveURL(expectedGoogleUrlPattern);
   62 |   });
   63 |
   64 |   test('should log in existing user and redirect to dashboard after successful OAuth login', async ({ page }) => {
   65 |     // Note: Requires setup for a user linked to GitHub.
   66 |     // TODO: VERIFY URL/PATTERN: Verify the exact GitHub callback URL pattern used by your app
   67 |     await page.route(GITHUB_CALLBACK_PATTERN, async (route) => {
   68 |       console.log(`Intercepted GitHub Callback (Success): ${route.request().url()}`);
   69 |       // TODO: VERIFY CONFIG: Verify the DASHBOARD_URL is the correct post-login destination
   70 |       // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) here if your frontend relies on them being set by the callback redirect.
   71 |       await route.fulfill({
   72 |         status: 302, 
   73 |         headers: { Location: DASHBOARD_URL },
   74 |       });
   75 |     });
   76 |
   77 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the GitHub login button
   78 |     const githubButton = page.getByRole('button', { name: /github/i });
   79 |     await githubButton.click();
   80 |
   81 |     // TODO: VERIFY CONFIG: Verify the DASHBOARD_URL is correct
   82 |     await page.waitForURL(DASHBOARD_URL);
   83 |     await expect(page).toHaveURL(DASHBOARD_URL);
   84 |
   85 |     // TODO: VERIFY SELECTOR: Verify/Update locator for a logged-in user indicator (e.g., avatar data-testid, username display)
   86 |     const userAvatar = page.getByTestId('user-avatar'); 
   87 |     await expect(userAvatar).toBeVisible();
   88 |   });
   89 |
   90 |   test('should show error message if OAuth login fails (e.g., provider error)', async ({ page }) => {
   91 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params like 'error') used when a provider returns an error
   92 |     const expectedErrorUrlPattern = /\/login\?error=oauth_error.*/i; 
   93 |     
   94 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Google login button
   95 |     const googleButton = page.getByRole('button', { name: /google/i });
   96 |
   97 |     // Mock the Google OAuth callback response for failure
   98 |     // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
   99 |     await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
  100 |       console.log(`Intercepted Google Callback (Failure): ${route.request().url()}`);
  101 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this error case
  102 |       const errorRedirectUrl = `${LOGIN_URL}?error=oauth_error&error_description=Access+Denied`;
  103 |       await route.fulfill({
  104 |         status: 302,
  105 |         headers: { Location: errorRedirectUrl },
  106 |       });
  107 |     });
  108 |
  109 |     await googleButton.click();
  110 |
  111 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
  112 |     await page.waitForURL(expectedErrorUrlPattern);
  113 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  114 |
  115 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert', data-testid)
  116 |     const errorMessage = page.getByRole('alert'); 
  117 |     await expect(errorMessage).toBeVisible();
  118 |     // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed to the user
  119 |     await expect(errorMessage).toContainText(/login failed|access denied/i);
  120 |   });
  121 |
  122 |   test('should show error message if user tries to log in with unlinked provider', async ({ page }) => {
  123 |     // Note: Requires setup for a user NOT linked to Facebook.
  124 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used for the 'account_not_linked' error
  125 |     const expectedErrorUrlPattern = /\/login\?error=account_not_linked.*/i; 
  126 |     
  127 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Facebook login button
  128 |     const facebookButton = page.getByRole('button', { name: /facebook/i }); 
  129 |
  130 |     console.log('Dependency: User unlinked-user@example.com must exist without Facebook link.');
  131 |
  132 |     // Mock the Facebook OAuth callback
  133 |     // TODO: VERIFY URL/PATTERN: Verify the exact Facebook callback URL pattern used by your app
  134 |     await page.route(FACEBOOK_CALLBACK_PATTERN, async (route) => {
  135 |       console.log(`Intercepted Facebook Callback (Unlinked): ${route.request().url()}`);
  136 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this error case
  137 |       const errorRedirectUrl = `${LOGIN_URL}?error=account_not_linked&email=unlinked-user@example.com`;
  138 |       await route.fulfill({
  139 |         status: 302,
  140 |         headers: { Location: errorRedirectUrl },
  141 |       });
  142 |     });
  143 |
> 144 |     await facebookButton.click();
      |                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  145 |
  146 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
  147 |     await page.waitForURL(expectedErrorUrlPattern);
  148 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  149 |
  150 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert', data-testid)
  151 |     const errorMessage = page.getByRole('alert');
  152 |     await expect(errorMessage).toBeVisible();
  153 |     // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed (e.g., suggests linking)
  154 |     await expect(errorMessage).toContainText(/account not linked|link your account/i);
  155 |   });
  156 |
  157 |   // TODO: Consider adding tests for other providers and edge cases (revoked access, state mismatch, etc.)
  158 | }); 
```