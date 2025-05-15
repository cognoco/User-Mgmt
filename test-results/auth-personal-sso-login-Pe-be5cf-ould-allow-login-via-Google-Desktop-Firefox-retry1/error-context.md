# Test info

- Name: Personal SSO Login Flows >> should allow login via Google
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\personal-sso-login.spec.ts:29:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Login/i
Received string:  "User Management"
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html lang="en" class="light">…</html>
      - unexpected value "User Management"

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\personal-sso-login.spec.ts:33:24
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
   1 | import { test, expect /*, Page */ } from '@playwright/test';
   2 |
   3 | // Base URL - Should ideally come from config
   4 | const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
   5 |
   6 | // Helper function for login steps if needed
   7 | // async function loginViaGoogle(page: Page) {
   8 | //   await page.goto(`${BASE_URL}/login`);
   9 | //   await page.locator('button:has-text("Sign in with Google")').click();
  10 |   
  11 | //   // --- !!! Interaction with Google's Login Page !!! ---
  12 | //   // This part is complex and often mocked.
  13 | //   // Example (pseudo-code):
  14 | //   // await expect(page).toHaveURL(/accounts.google.com/);
  15 | //   // await page.locator('input[type="email"]').fill('test_user@gmail.com');
  16 | //   // await page.locator('#identifierNext').click();
  17 | //   // await page.locator('input[type="password"]').fill('test_password');
  18 | //   // await page.locator('#passwordNext').click();
  19 | //   // Handle 2FA if necessary
  20 |   
  21 | //   // Wait for redirection back to your app's callback URL
  22 | //   await page.waitForURL(`${BASE_URL}/api/auth/oauth/callback*`);
  23 |
  24 | //   // After callback, wait for navigation to the final destination (e.g., dashboard)
  25 | //   await page.waitForURL(`${BASE_URL}/dashboard`); // Adjust expected final URL
  26 | // }
  27 |
  28 | test.describe('Personal SSO Login Flows', () => {
  29 |   test('should allow login via Google', async ({ page }) => {
  30 |     await page.goto(`${BASE_URL}/login`);
  31 |
  32 |     // Expect the login page title
> 33 |     await expect(page).toHaveTitle(/Login/i); // Adjust title check as needed
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
  34 |
  35 |     // Find the Google sign-in button
  36 |     const googleButton = page.locator('button:has-text("Sign in with Google")');
  37 |     await expect(googleButton).toBeVisible();
  38 |
  39 |     // Click the Google button
  40 |     // In a real test, we might capture the network request or expected URL instead of clicking
  41 |     // For now, we simulate the click
  42 |     await googleButton.click();
  43 |
  44 |     // --- Mocking Strategy Needed Here ---
  45 |     // Option 1: Assert redirection URL
  46 |     // await expect(page).toHaveURL(/accounts.google.com/); 
  47 |     // The test would likely end here unless fully interacting or mocking the callback.
  48 |
  49 |     // Option 2: Mock the callback 
  50 |     // (Requires intercepting network requests or server-side test setup)
  51 |     // e.g., Intercept the call to /api/auth/oauth/callback and return a success response
  52 |     // Then assert navigation to the dashboard or expected logged-in page.
  53 |     
  54 |     // Placeholder assertion: Wait for potential navigation (will likely fail without mocking)
  55 |     // await page.waitForURL(`${BASE_URL}/dashboard`); // Adjust as needed
  56 |     // await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  57 |
  58 |     // TODO: Implement mocking strategy for OAuth callback
  59 |     console.log('TODO: Implement mocking strategy for Google OAuth callback');
  60 |     // For now, just assert the button was clickable (already done by the click action)
  61 |     expect(true).toBe(true); // Placeholder assertion
  62 |   });
  63 |
  64 |   // Add similar tests for other providers (GitHub, etc.)
  65 |   test('should allow login via GitHub', async ({ page }) => {
  66 |     await page.goto(`${BASE_URL}/login`);
  67 |     const githubButton = page.locator('button:has-text("Sign in with GitHub")');
  68 |     await expect(githubButton).toBeVisible();
  69 |     await githubButton.click();
  70 |     // --- Mocking Strategy Needed Here ---
  71 |     console.log('TODO: Implement mocking strategy for GitHub OAuth callback');
  72 |     expect(true).toBe(true); // Placeholder assertion
  73 |   });
  74 |
  75 |   // Add tests for error handling, signup flow, etc.
  76 | }); 
```