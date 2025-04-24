import { test, expect } from '@playwright/test';

// TODO: SETUP: Implement this helper function or integrate actual user setup logic
// async function setupUser(options: { email: string; linkedProviders?: string[] }) {
//   console.log('Setting up user:', options);
//   // Needs logic to create/ensure user exists (API call, DB seeding, etc.)
// }

// TODO: SETUP: Implement this helper function or integrate actual user deletion logic
// async function deleteUser(email: string) {
//  console.log('Deleting user:', email);
//  // Needs logic to delete user (API call, DB seeding, etc.)
// }

test.describe('E2E: OAuth SSO Login Flow', () => {
  // TODO: VERIFY CONFIG: Adjust base URLs to match your application
  const LOGIN_URL = '/login';
  const DASHBOARD_URL = '/dashboard';

  // TODO: VERIFY CONFIG: Adjust API callback paths & providers to match your backend routes
  const GITHUB_CALLBACK_PATTERN = '**/api/auth/callback/github?**';
  const GOOGLE_CALLBACK_PATTERN = '**/api/auth/callback/google?**';
  const FACEBOOK_CALLBACK_PATTERN = '**/api/auth/callback/facebook?**';

  test.beforeEach(async ({ page, context }) => {
    // --- START User Setup --- 
    // TODO: SETUP: Replace placeholder below with calls to actual user setup/teardown functions.
    // Ensure the correct user state (e.g., linked to GitHub, NOT linked to Facebook) exists before each test.
    console.log('Placeholder: Execute test user setup here (e.g., `await setupUser(...)`)...');
    // --- END User Setup --- 

    // Ensure logged out state
    await context.clearCookies();
    // await page.evaluate(() => localStorage.clear()); // Uncomment if using localStorage for tokens

    // Navigate to the login page
    // TODO: VERIFY CONFIG: Double-check LOGIN_URL is correct
    await page.goto(LOGIN_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should display OAuth provider buttons on login page', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Verify/Update locators for OAuth buttons (check data-testid, aria-label, visible text)
    const googleButton = page.getByRole('button', { name: /google/i });
    const githubButton = page.getByRole('button', { name: /github/i });
    // Add other providers as needed

    await expect(googleButton).toBeVisible();
    await expect(githubButton).toBeVisible();
  });

  test('should redirect to OAuth provider for login (e.g., Google)', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Verify/Update locator for the Google login button
    const googleButton = page.getByRole('button', { name: /google/i });

    await googleButton.click();

    // TODO: VERIFY URL/PATTERN: Verify the exact URL pattern for Google's OAuth consent/login screen
    const expectedGoogleUrlPattern = /^https:\/\/accounts\.google\.com\/.*/;
    await page.waitForURL(expectedGoogleUrlPattern);
    await expect(page).toHaveURL(expectedGoogleUrlPattern);
  });

  test('should log in existing user and redirect to dashboard after successful OAuth login', async ({ page }) => {
    // Note: Requires setup for a user linked to GitHub.
    // TODO: VERIFY URL/PATTERN: Verify the exact GitHub callback URL pattern used by your app
    await page.route(GITHUB_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted GitHub Callback (Success): ${route.request().url()}`);
      // TODO: VERIFY CONFIG: Verify the DASHBOARD_URL is the correct post-login destination
      // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) here if your frontend relies on them being set by the callback redirect.
      await route.fulfill({
        status: 302, 
        headers: { Location: DASHBOARD_URL },
      });
    });

    // TODO: VERIFY SELECTOR: Verify/Update locator for the GitHub login button
    const githubButton = page.getByRole('button', { name: /github/i });
    await githubButton.click();

    // TODO: VERIFY CONFIG: Verify the DASHBOARD_URL is correct
    await page.waitForURL(DASHBOARD_URL);
    await expect(page).toHaveURL(DASHBOARD_URL);

    // TODO: VERIFY SELECTOR: Verify/Update locator for a logged-in user indicator (e.g., avatar data-testid, username display)
    const userAvatar = page.getByTestId('user-avatar'); 
    await expect(userAvatar).toBeVisible();
  });

  test('should show error message if OAuth login fails (e.g., provider error)', async ({ page }) => {
    // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params like 'error') used when a provider returns an error
    const expectedErrorUrlPattern = /\/login\?error=oauth_error.*/i; 
    
    // TODO: VERIFY SELECTOR: Verify/Update locator for the Google login button
    const googleButton = page.getByRole('button', { name: /google/i });

    // Mock the Google OAuth callback response for failure
    // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
    await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted Google Callback (Failure): ${route.request().url()}`);
      // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this error case
      const errorRedirectUrl = `${LOGIN_URL}?error=oauth_error&error_description=Access+Denied`;
      await route.fulfill({
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    });

    await googleButton.click();

    // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
    await page.waitForURL(expectedErrorUrlPattern);
    await expect(page).toHaveURL(expectedErrorUrlPattern);

    // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert', data-testid)
    const errorMessage = page.getByRole('alert'); 
    await expect(errorMessage).toBeVisible();
    // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed to the user
    await expect(errorMessage).toContainText(/login failed|access denied/i);
  });

  test('should show error message if user tries to log in with unlinked provider', async ({ page }) => {
    // Note: Requires setup for a user NOT linked to Facebook.
    // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used for the 'account_not_linked' error
    const expectedErrorUrlPattern = /\/login\?error=account_not_linked.*/i; 
    
    // TODO: VERIFY SELECTOR: Verify/Update locator for the Facebook login button
    const facebookButton = page.getByRole('button', { name: /facebook/i }); 

    console.log('Dependency: User unlinked-user@example.com must exist without Facebook link.');

    // Mock the Facebook OAuth callback
    // TODO: VERIFY URL/PATTERN: Verify the exact Facebook callback URL pattern used by your app
    await page.route(FACEBOOK_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted Facebook Callback (Unlinked): ${route.request().url()}`);
      // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this error case
      const errorRedirectUrl = `${LOGIN_URL}?error=account_not_linked&email=unlinked-user@example.com`;
      await route.fulfill({
        status: 302,
        headers: { Location: errorRedirectUrl },
      });
    });

    await facebookButton.click();

    // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
    await page.waitForURL(expectedErrorUrlPattern);
    await expect(page).toHaveURL(expectedErrorUrlPattern);

    // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert', data-testid)
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed (e.g., suggests linking)
    await expect(errorMessage).toContainText(/account not linked|link your account/i);
  });

  // TODO: Consider adding tests for other providers and edge cases (revoked access, state mismatch, etc.)
}); 