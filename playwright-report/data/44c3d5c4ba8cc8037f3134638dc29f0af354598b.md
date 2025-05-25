# Test info

- Name: E2E: OAuth SSO Signup Flow >> should display OAuth provider buttons on signup page
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\sso\sso-signup-oauth.e2e.test.ts:37:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3001/signup", waiting until "load"

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\sso\sso-signup-oauth.e2e.test.ts:32:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // TODO: SETUP: Implement this helper function or integrate actual user setup logic
   4 | // async function setupUser(options: { email: string; password?: string; linkedProviders?: string[] }) {
   5 | //   console.log('Setting up user:', options);
   6 | //   // Needs logic to create/ensure user exists (API call, DB seeding, etc.)
   7 | // }
   8 |
   9 | // TODO: SETUP: Implement this helper function or integrate actual user deletion logic
   10 | // async function deleteTestUser(email: string) {
   11 | //   console.log('Deleting user:', email);
   12 | //   // Needs logic to delete user (API call, DB seeding, etc.)
   13 | // }
   14 |
   15 | test.describe('E2E: OAuth SSO Signup Flow', () => {
   16 |   // TODO: VERIFY CONFIG: Adjust base URLs to match your application
   17 |   const SIGNUP_URL = '/signup';
   18 |   const POST_SIGNUP_URL = '/dashboard/overview'; // TODO: VERIFY CONFIG: Or /welcome, /profile/setup etc.
   19 |
   20 |   // TODO: VERIFY CONFIG: Adjust API callback paths & providers to match your backend routes
   21 |   const GITHUB_CALLBACK_PATTERN = '**/api/auth/callback/github?**';
   22 |   const GOOGLE_CALLBACK_PATTERN = '**/api/auth/callback/google?**';
   23 |   const FACEBOOK_CALLBACK_PATTERN = '**/api/auth/callback/facebook?**';
   24 |
   25 |   test.beforeEach(async ({ page, context }) => {
   26 |     // Ensure logged out state
   27 |     await context.clearCookies();
   28 |     // await page.evaluate(() => localStorage.clear()); // Uncomment if using localStorage for tokens
   29 |
   30 |     // Navigate to the signup page
   31 |     // TODO: VERIFY CONFIG: Double-check SIGNUP_URL is correct
>  32 |     await page.goto(SIGNUP_URL);
      |                ^ Error: page.goto: Target page, context or browser has been closed
   33 |     await expect(page).toHaveURL(SIGNUP_URL);
   34 |     // Note: Specific user existence/non-existence setup might be needed per-test (see TODOs within tests)
   35 |   });
   36 |
   37 |   test('should display OAuth provider buttons on signup page', async ({ page }) => {
   38 |     // TODO: VERIFY SELECTOR: Verify/Update locators for OAuth buttons (check data-testid, aria-label, visible text, e.g., "Sign up with Google")
   39 |     const googleButton = page.getByRole('button', { name: /sign up with google/i }); 
   40 |     const githubButton = page.getByRole('button', { name: /sign up with github/i }); 
   41 |     // Add other providers as needed
   42 |
   43 |     await expect(googleButton).toBeVisible();
   44 |     await expect(githubButton).toBeVisible();
   45 |   });
   46 |
   47 |   test('should redirect to OAuth provider for signup (e.g., Google)', async ({ page }) => {
   48 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
   49 |     const googleButton = page.getByRole('button', { name: /sign up with google/i });
   50 |
   51 |     await googleButton.click();
   52 |
   53 |     // TODO: VERIFY URL/PATTERN: Verify the exact URL pattern for Google's OAuth consent/signup screen
   54 |     const expectedGoogleUrlPattern = /^https:\/\/accounts\.google\.com\/.*/;
   55 |     await page.waitForURL(expectedGoogleUrlPattern);
   56 |     await expect(page).toHaveURL(expectedGoogleUrlPattern);
   57 |   });
   58 |
   59 |   test('should create new user and redirect after successful OAuth signup', async ({ page }) => {
   60 |     // --- START Test Specific User Setup ---
   61 |     // TODO: SETUP: Ensure user 'new-github-user@example.com' does NOT exist before this test runs.
   62 |     // Example: await deleteTestUser('new-github-user@example.com');
   63 |     console.log('SETUP Dependency: User new-github-user@example.com should NOT exist.');
   64 |     // --- END Test Specific User Setup ---
   65 |
   66 |     // Mock the GitHub OAuth callback for a new user signup
   67 |     // TODO: VERIFY URL/PATTERN: Verify the exact GitHub callback URL pattern used by your app
   68 |     await page.route(GITHUB_CALLBACK_PATTERN, async (route) => {
   69 |       console.log(`Intercepted GitHub Callback (Signup): ${route.request().url()}`);
   70 |       // Simulate backend creating user, setting session, and redirecting
   71 |       // TODO: VERIFY CONFIG: Verify POST_SIGNUP_URL is the correct destination after signup
   72 |       // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) here if needed for the frontend session
   73 |       await route.fulfill({
   74 |         status: 302, // Found (Redirect)
   75 |         headers: { Location: POST_SIGNUP_URL },
   76 |       });
   77 |     });
   78 |
   79 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the GitHub signup button
   80 |     const githubButton = page.getByRole('button', { name: /sign up with github/i });
   81 |     await githubButton.click();
   82 |
   83 |     // Wait for navigation to the post-signup URL
   84 |     // TODO: VERIFY CONFIG: Verify POST_SIGNUP_URL is correct
   85 |     await page.waitForURL(POST_SIGNUP_URL);
   86 |     await expect(page).toHaveURL(POST_SIGNUP_URL);
   87 |
   88 |     // Assert user is logged in (e.g., check for avatar or welcome message)
   89 |     // TODO: VERIFY SELECTOR: Verify/Update locator for a logged-in user indicator (e.g., avatar data-testid) or welcome message
   90 |     const userIndicator = page.getByTestId('user-avatar') || page.getByText(/welcome/i);
   91 |     await expect(userIndicator.first()).toBeVisible(); // Use first() if selector matches multiple
   92 |   });
   93 |
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
```