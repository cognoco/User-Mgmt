# Test info

- Name: Email Verification Flow >> User sees verification prompt after registration
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\email-verification.e2e.test.ts:10:3

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeEnabled()

Locator: locator('button[type="submit"]')
Expected: enabled
Received: disabled
Call log:
  - expect.toBeEnabled with timeout 10000ms
  - waiting for locator('button[type="submit"]')
    13 × locator resolved to <button disabled type="submit" data-testid="submit-button" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full">Create Account</button>
       - unexpected value "disabled"

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\email-verification.e2e.test.ts:24:32
```

# Page snapshot

```yaml
- heading "Create Your Account" [level=1]
- heading "Create Your Account" [level=1]
- paragraph: Register for a new account to get started
- text: Email *
- textbox "Email *"
- text: First Name *
- textbox "First Name *": Test
- text: Last Name *
- textbox "Last Name *": User
- text: Password *
- textbox "Password *": TestPassword123!
- list:
  - listitem: At least 8 characters
  - listitem: At least one uppercase letter
  - listitem: At least one lowercase letter
  - listitem: At least one number
  - listitem: At least one special character
- text: Confirm Password *
- textbox "Confirm Password *": TestPassword123!
- checkbox "Accept terms and conditions and privacy policy" [checked]:
  - img
- text: I agree to the
- link "Terms and Conditions":
  - /url: /terms
- text: and
- link "Privacy Policy":
  - /url: /privacy
- text: .
- button "Create Account" [disabled]
- button "G Sign up with Google"
- button "A Sign up with Apple"
- button "GH Sign up with GitHub"
- text: or
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /login
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // --- Constants and Test Data --- //
   4 | const REGISTER_URL = '/register';
   5 | const USER_EMAIL = 'testuser+' + Date.now() + '@example.com';
   6 | const USER_PASSWORD = 'TestPassword123!';
   7 |
   8 | // --- Test Suite --- //
   9 | test.describe('Email Verification Flow', () => {
  10 |   test('User sees verification prompt after registration', async ({ page }) => {
  11 |     await page.goto(REGISTER_URL);
  12 |     // If user type selection is present, select "Personal"
  13 |     const userTypeRadio = page.locator('[data-testid="user-type-private"]');
  14 |     if (await userTypeRadio.count()) {
  15 |       await userTypeRadio.click();
  16 |     }
  17 |     await page.fill('[data-testid="email-input"]', USER_EMAIL);
  18 |     await page.fill('[data-testid="first-name-input"]', 'Test');
  19 |     await page.fill('[data-testid="last-name-input"]', 'User');
  20 |     await page.fill('[data-testid="password-input"]', USER_PASSWORD);
  21 |     await page.fill('[data-testid="confirm-password-input"]', USER_PASSWORD);
  22 |     await page.check('[data-testid="accept-terms-checkbox"]');
  23 |     const submitButton = page.locator('button[type="submit"]');
> 24 |     await expect(submitButton).toBeEnabled({ timeout: 10000 });
     |                                ^ Error: Timed out 10000ms waiting for expect(locator).toBeEnabled()
  25 |     await submitButton.click();
  26 |     // Assert verification prompt is shown
  27 |     await expect(
  28 |       page.locator('text=Check your email')
  29 |         .or(page.locator('text=Verification email sent'))
  30 |         .or(page.locator('text=Verify your email'))
  31 |     ).toBeVisible({ timeout: 10000 });
  32 |   });
  33 |
  34 |   test('User can verify email via link (placeholder)', async () => {
  35 |     // TODO: Simulate clicking the verification link in the email
  36 |     // This requires email interception/mocking or a test inbox
  37 |     // Example:
  38 |     // await page.goto('/verify-email?token=...');
  39 |     // await expect(page.getByText(/email verified|verification successful/i)).toBeVisible();
  40 |     // Optionally, try logging in and assert success
  41 |   });
  42 | }); 
```