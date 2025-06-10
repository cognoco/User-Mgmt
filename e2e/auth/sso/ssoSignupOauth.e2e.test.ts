import { test, expect } from '@playwright/test';

// TODO: SETUP: Implement this helper function or integrate actual user setup logic
// async function setupUser(options: { email: string; password?: string; linkedProviders?: string[] }) {
//   console.log('Setting up user:', options);
//   // Needs logic to create/ensure user exists (API call, DB seeding, etc.)
// }

// TODO: SETUP: Implement this helper function or integrate actual user deletion logic
// async function deleteTestUser(email: string) {
//   console.log('Deleting user:', email);
//   // Needs logic to delete user (API call, DB seeding, etc.)
// }

test.describe('E2E: OAuth SSO Signup Flow', () => {
  // TODO: VERIFY CONFIG: Adjust base URLs to match your application
  const SIGNUP_URL = '/signup';
  const POST_SIGNUP_URL = '/dashboard/overview'; // TODO: VERIFY CONFIG: Or /welcome, /profile/setup etc.

  // TODO: VERIFY CONFIG: Adjust API callback paths & providers to match your backend routes
  const GITHUB_CALLBACK_PATTERN = '**/api/auth/callback/github?**';
  const GOOGLE_CALLBACK_PATTERN = '**/api/auth/callback/google?**';
  const FACEBOOK_CALLBACK_PATTERN = '**/api/auth/callback/facebook?**';

  test.beforeEach(async ({ page, context }) => {
    // Ensure logged out state
    await context.clearCookies();
    // await page.evaluate(() => localStorage.clear()); // Uncomment if using localStorage for tokens

    // Navigate to the signup page
    // TODO: VERIFY CONFIG: Double-check SIGNUP_URL is correct
    await page.goto(SIGNUP_URL);
    await expect(page).toHaveURL(SIGNUP_URL);
    // Note: Specific user existence/non-existence setup might be needed per-test (see TODOs within tests)
  });

  test('should display OAuth provider buttons on signup page', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Verify/Update locators for OAuth buttons (check data-testid, aria-label, visible text, e.g., "Sign up with Google")
    const googleButton = page.getByRole('button', { name: /sign up with google/i }); 
    const githubButton = page.getByRole('button', { name: /sign up with github/i }); 
    // Add other providers as needed

    await expect(googleButton).toBeVisible();
    await expect(githubButton).toBeVisible();
  });

  test('should redirect to OAuth provider for signup (e.g., Google)', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
    const googleButton = page.getByRole('button', { name: /sign up with google/i });

    await googleButton.click();

    // TODO: VERIFY URL/PATTERN: Verify the exact URL pattern for Google's OAuth consent/signup screen
    const expectedGoogleUrlPattern = /^https:\/\/accounts\.google\.com\/.*/;
    await page.waitForURL(expectedGoogleUrlPattern);
    await expect(page).toHaveURL(expectedGoogleUrlPattern);
  });

  test('should create new user and redirect after successful OAuth signup', async ({ page }) => {
    // --- START Test Specific User Setup ---
    // TODO: SETUP: Ensure user 'new-github-user@example.com' does NOT exist before this test runs.
    // Example: await deleteTestUser('new-github-user@example.com');
    console.log('SETUP Dependency: User new-github-user@example.com should NOT exist.');
    // --- END Test Specific User Setup ---

    // Mock the GitHub OAuth callback for a new user signup
    // TODO: VERIFY URL/PATTERN: Verify the exact GitHub callback URL pattern used by your app
    await page.route(GITHUB_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted GitHub Callback (Signup): ${route.request().url()}`);
      // Simulate backend creating user, setting session, and redirecting
      // TODO: VERIFY CONFIG: Verify POST_SIGNUP_URL is the correct destination after signup
      // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) here if needed for the frontend session
      await route.fulfill({
        status: 302, // Found (Redirect)
        headers: { Location: POST_SIGNUP_URL },
      });
    });

    // TODO: VERIFY SELECTOR: Verify/Update locator for the GitHub signup button
    const githubButton = page.getByRole('button', { name: /sign up with github/i });
    await githubButton.click();

    // Wait for navigation to the post-signup URL
    // TODO: VERIFY CONFIG: Verify POST_SIGNUP_URL is correct
    await page.waitForURL(POST_SIGNUP_URL);
    await expect(page).toHaveURL(POST_SIGNUP_URL);

    // Assert user is logged in (e.g., check for avatar or welcome message)
    // TODO: VERIFY SELECTOR: Verify/Update locator for a logged-in user indicator (e.g., avatar data-testid) or welcome message
    const userIndicator = page.getByTestId('user-avatar') || page.getByText(/welcome/i);
    await expect(userIndicator.first()).toBeVisible(); // Use first() if selector matches multiple
  });

  test('should prompt to link account if email already exists', async ({ page }) => {
    const existingUserEmail = 'existing-user@example.com';
    // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params like 'error', 'prompt') used for the email conflict/linking prompt
    const expectedErrorUrlPattern = /\/signup\?error=email_exists&prompt=link_account.*/i;

    // --- START Test Specific User Setup ---
    // TODO: SETUP: Ensure user 'existing-user@example.com' DOES exist (e.g., created via password) before this test runs.
    // Example: await setupUser({ email: existingUserEmail, password: 'password123' });
    console.log(`SETUP Dependency: User ${existingUserEmail} MUST exist.`);
    // --- END Test Specific User Setup ---

    // Mock the Google OAuth callback - simulates Google returning the existing email
    // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
    await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted Google Callback (Email Exists): ${route.request().url()}`);
      // Simulate backend detecting email conflict and redirecting back with prompt
      // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this conflict case
      const conflictRedirectUrl = `${SIGNUP_URL}?error=email_exists&prompt=link_account&email=${encodeURIComponent(existingUserEmail)}`;
      await route.fulfill({
        status: 302,
        headers: { Location: conflictRedirectUrl },
      });
    });

    // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
    const googleButton = page.getByRole('button', { name: /sign up with google/i });
    await googleButton.click();

    // Wait for navigation back to the signup page with the specific error/prompt
    // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
    await page.waitForURL(expectedErrorUrlPattern);
    await expect(page).toHaveURL(expectedErrorUrlPattern);

    // Assert that a specific "email exists / link account" message is displayed
    // TODO: VERIFY SELECTOR: Verify/Update locator for the specific prompt message element (e.g., role='alert')
    const promptMessage = page.getByRole('alert'); 
    await expect(promptMessage).toBeVisible();
    // TODO: VERIFY ERROR HANDLING: Verify the exact prompt message text displayed (suggesting linking)
    await expect(promptMessage).toContainText(/email already exists|account already exists|link your account/i);
    // Optionally, check for a button to link the account or log in normally
  });

  test('should show error message if OAuth provider returns an error', async ({ page }) => {
    // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used when the provider returns an error during signup
    const expectedErrorUrlPattern = /\/signup\?error=oauth_provider_error&provider=facebook.*/i;

    // TODO: VERIFY SELECTOR: Verify/Update locator for the Facebook signup button
    const facebookButton = page.getByRole('button', { name: /sign up with facebook/i });

    // Mock the Facebook OAuth callback - simulate the provider redirecting with an error
    // TODO: VERIFY URL/PATTERN: Verify the exact Facebook callback URL pattern used by your app
    await page.route(FACEBOOK_CALLBACK_PATTERN, async (route) => {
      const callbackUrlWithErrorFromProvider = route.request().url().split('?')[0] + '?error=access_denied&error_description=User+denied+access';
      console.log(`Simulating Provider Callback Failure URL: ${callbackUrlWithErrorFromProvider}`); 

      // Simulate our backend processing this errored callback and redirecting to signup page
      console.log(`Intercepted Facebook Callback (Provider Error): ${route.request().url()}`);
      // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this provider error case
      const appErrorRedirectUrl = `${SIGNUP_URL}?error=oauth_provider_error&provider=facebook&provider_error=access_denied`;
      await route.fulfill({
        status: 302,
        headers: { Location: appErrorRedirectUrl },
      });
    });

    await facebookButton.click();

    // Wait for navigation back to the signup page with the specific error
    // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
    await page.waitForURL(expectedErrorUrlPattern);
    await expect(page).toHaveURL(expectedErrorUrlPattern);

    // Assert that a specific error message is displayed
    // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert')
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed for provider errors
    await expect(errorMessage).toContainText(/failed to sign up|access denied|provider error/i);
  });

  test('should show error if essential info is missing (e.g., email)', async ({ page }) => {
    // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) used when required info (like email) is missing from provider
    const expectedErrorUrlPattern = /\/signup\?error=missing_required_info&field=email.*/i;

    // TODO: VERIFY SELECTOR: Verify/Update locator for the Google signup button
    const googleButton = page.getByRole('button', { name: /sign up with google/i });

    // Mock the Google OAuth callback - successful auth, but backend finds email missing
    // TODO: VERIFY URL/PATTERN: Verify the exact Google callback URL pattern used by your app
    await page.route(GOOGLE_CALLBACK_PATTERN, async (route) => {
      console.log(`Intercepted Google Callback (Missing Email): ${route.request().url()}`);
      // Simulate backend processing and finding email missing from provider data
      // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params your app uses for this missing info case
      const missingInfoRedirectUrl = `${SIGNUP_URL}?error=missing_required_info&field=email`;
      await route.fulfill({
        status: 302,
        headers: { Location: missingInfoRedirectUrl },
      });
    });

    await googleButton.click();

    // Wait for navigation back to the signup page with the specific error
    // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
    await page.waitForURL(expectedErrorUrlPattern);
    await expect(page).toHaveURL(expectedErrorUrlPattern);

    // Assert that a specific error message is displayed
    // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element (e.g., role='alert')
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed for missing email/info
    await expect(errorMessage).toContainText(/email is required|missing required information/i);
  });
}); 