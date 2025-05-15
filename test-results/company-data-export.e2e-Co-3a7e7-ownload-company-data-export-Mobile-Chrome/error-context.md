# Test info

- Name: Company Data Export E2E >> Admin can request and download company data export
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\company-data-export.e2e.test.ts:4:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/profile" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\company-data-export.e2e.test.ts:10:16
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
- textbox "Email": adminuser@example.com
- text: Password
- textbox "Password": adminpassword123
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
   3 | test.describe('Company Data Export E2E', () => {
   4 |   test('Admin can request and download company data export', async ({ page }) => {
   5 |     // Login as an admin user (replace with your login helper or flow)
   6 |     await page.goto('/login');
   7 |     await page.fill('input[name="email"]', 'adminuser@example.com');
   8 |     await page.fill('input[name="password"]', 'adminpassword123');
   9 |     await page.click('button[type="submit"]');
> 10 |     await page.waitForURL('/profile');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  11 |
  12 |     // Navigate to profile page (if not redirected)
  13 |     await page.goto('/profile');
  14 |     await expect(page.getByText('Export Company Data')).toBeVisible();
  15 |
  16 |     // Click the export button
  17 |     const exportBtn = page.getByText('Download Company Data');
  18 |     await exportBtn.click();
  19 |     // Check for success message (download will be triggered in browser)
  20 |     await expect(page.getByText('Company data export has been downloaded successfully.')).toBeVisible();
  21 |   });
  22 | });
  23 |
```