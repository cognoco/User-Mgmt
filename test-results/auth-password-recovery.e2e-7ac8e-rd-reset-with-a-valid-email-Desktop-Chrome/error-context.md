# Test info

- Name: Password Recovery (Forgot Password) Flow >> User can request a password reset with a valid email
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\password-recovery.e2e.test.ts:9:3

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/email/i)

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\password-recovery.e2e.test.ts:11:37
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // --- Constants and Test Data --- //
   4 | const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
   5 | const FORGOT_PASSWORD_URL = '/forgot-password';
   6 |
   7 | // --- Test Suite --- //
   8 | test.describe('Password Recovery (Forgot Password) Flow', () => {
   9 |   test('User can request a password reset with a valid email', async ({ page }) => {
  10 |     await page.goto(FORGOT_PASSWORD_URL);
> 11 |     await page.getByLabel(/email/i).fill(USER_EMAIL);
     |                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  12 |     await page.getByRole('button', { name: /reset|send|submit/i }).click();
  13 |     // Assert success message is shown
  14 |     await expect(page.getByText(/check your email|reset link sent|email sent/i)).toBeVisible();
  15 |   });
  16 |
  17 |   test('Shows error or info on invalid/unregistered email', async ({ page }) => {
  18 |     await page.goto(FORGOT_PASSWORD_URL);
  19 |     await page.getByLabel(/email/i).fill('notarealuser@example.com');
  20 |     await page.getByRole('button', { name: /reset|send|submit/i }).click();
  21 |     // Assert error or info message is shown
  22 |     await expect(page.getByText(/not found|no account|invalid|sent if exists/i)).toBeVisible();
  23 |   });
  24 |
  25 |   test('User can reset password via email link (placeholder)', async () => {
  26 |     // TODO: Simulate clicking the reset link in the email and setting a new password
  27 |     // This requires email interception/mocking or a test inbox
  28 |     // Example:
  29 |     // await page.goto('/reset-password?token=...');
  30 |     // await page.getByLabel(/new password/i).fill('NewPassword123!');
  31 |     // await page.getByLabel(/confirm password/i).fill('NewPassword123!');
  32 |     // await page.getByRole('button', { name: /reset|submit/i }).click();
  33 |     // await expect(page.getByText(/password updated|reset successful/i)).toBeVisible();
  34 |   });
  35 | }); 
```