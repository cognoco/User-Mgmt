# Test info

- Name: Activity Log E2E >> User can view their activity log
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\activity-log.e2e.test.ts:4:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/profile" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\activity-log.e2e.test.ts:10:16
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
- paragraph: Please enter a valid email address
- text: Password
- textbox "Password": password123
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Activity Log E2E', () => {
   4 |   test('User can view their activity log', async ({ page }) => {
   5 |     // Login as a test user (replace with your login helper or flow)
   6 |     await page.goto('/login');
   7 |     await page.fill('input[name="email"]', 'testuser@example.com');
   8 |     await page.fill('input[name="password"]', 'password123');
   9 |     await page.click('button[type="submit"]');
> 10 |     await page.waitForURL('/profile');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  11 |
  12 |     // Navigate to profile page (if not redirected)
  13 |     await page.goto('/profile');
  14 |     await expect(page.getByText('Account Activity Log')).toBeVisible();
  15 |
  16 |     // Should see at least one log entry (if any exist)
  17 |     // This will depend on test data in the DB
  18 |     // Check for table headers
  19 |     await expect(page.getByText('Action')).toBeVisible();
  20 |     await expect(page.getByText('Status')).toBeVisible();
  21 |     await expect(page.getByText('IP')).toBeVisible();
  22 |     await expect(page.getByText('Device')).toBeVisible();
  23 |   });
  24 | });
  25 |
```