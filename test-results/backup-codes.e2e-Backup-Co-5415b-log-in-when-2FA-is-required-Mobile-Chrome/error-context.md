# Test info

- Name: Backup Codes E2E >> User can use a backup code to log in when 2FA is required
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\backup-codes.e2e.test.ts:36:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/mfa**" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\backup-codes.e2e.test.ts:41:16
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
- textbox "Email": user@example.com
- text: Password
- textbox "Password": userpassword
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
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const backupCodes = [
   4 |   'ABCD-1234',
   5 |   'EFGH-5678',
   6 |   'IJKL-9012',
   7 |   'MNOP-3456',
   8 |   'QRST-7890',
   9 |   'UVWX-2345',
  10 |   'YZAB-6789',
  11 |   'CDEF-0123',
  12 |   'GHIJ-4567',
  13 |   'KLMN-8901',
  14 | ];
  15 |
  16 | test.describe('Backup Codes E2E', () => {
  17 |   test('User can generate, download, and regenerate backup codes in settings', async ({ page }) => {
  18 |     await page.goto('/login');
  19 |     await page.fill('input[name="email"]', 'user@example.com');
  20 |     await page.fill('input[name="password"]', 'userpassword');
  21 |     await page.click('button[type="submit"]');
  22 |     await page.waitForURL('**/dashboard**');
  23 |     await page.goto('/settings/security');
  24 |     await page.click('text=View Backup Codes');
  25 |     for (const code of backupCodes) {
  26 |       await expect(page.getByText(code)).toBeVisible();
  27 |     }
  28 |     await page.click('text=Download');
  29 |     await page.click('text=Copy');
  30 |     await page.click('text=Regenerate');
  31 |     for (const code of backupCodes) {
  32 |       await expect(page.getByText(code)).toBeVisible();
  33 |     }
  34 |   });
  35 |
  36 |   test('User can use a backup code to log in when 2FA is required', async ({ page }) => {
  37 |     await page.goto('/login');
  38 |     await page.fill('input[name="email"]', 'user@example.com');
  39 |     await page.fill('input[name="password"]', 'userpassword');
  40 |     await page.click('button[type="submit"]');
> 41 |     await page.waitForURL('**/mfa**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  42 |     await page.click('text=Use Backup Code');
  43 |     await page.fill('input[placeholder="XXXX-XXXX"]', backupCodes[0]);
  44 |     await page.click('button:has-text("Verify")');
  45 |     await expect(page.getByText(/success|dashboard|welcome/i)).toBeVisible();
  46 |   });
  47 |
  48 |   test('Shows error for invalid backup code', async ({ page }) => {
  49 |     await page.goto('/login');
  50 |     await page.fill('input[name="email"]', 'user@example.com');
  51 |     await page.fill('input[name="password"]', 'userpassword');
  52 |     await page.click('button[type="submit"]');
  53 |     await page.waitForURL('**/mfa**');
  54 |     await page.click('text=Use Backup Code');
  55 |     await page.fill('input[placeholder="XXXX-XXXX"]', 'WRONG-0000');
  56 |     await page.click('button:has-text("Verify")');
  57 |     await expect(page.getByText(/invalid backup code|failed to verify/i)).toBeVisible();
  58 |   });
  59 | });
  60 |
```