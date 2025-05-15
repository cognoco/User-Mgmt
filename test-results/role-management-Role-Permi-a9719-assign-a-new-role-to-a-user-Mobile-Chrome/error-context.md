# Test info

- Name: Role/Permission Management UI >> Admin can assign a new role to a user
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\role-management.spec.ts:28:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/admin**" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\role-management.spec.ts:34:16
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
- textbox "Email": admin@example.com
- text: Password
- textbox "Password": adminpassword
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
   3 | // Adjust selectors and URLs as needed for your app
   4 |
   5 | test.describe('Role/Permission Management UI', () => {
   6 |   test('Admin can log in and see the Role Management Panel', async ({ page }) => {
   7 |     // Go to login page
   8 |     await page.goto('/login');
   9 |
  10 |     // Fill in admin credentials (replace with test admin user)
  11 |     await page.fill('input[name="email"]', 'admin@example.com');
  12 |     await page.fill('input[name="password"]', 'adminpassword');
  13 |     await page.click('button[type="submit"]');
  14 |
  15 |     // Wait for navigation to dashboard or admin area
  16 |     await page.waitForURL('**/admin**', { timeout: 10000 });
  17 |
  18 |     // Navigate to Role Management Panel if not default
  19 |     // await page.click('a[href="/admin/roles"]'); // Uncomment if needed
  20 |
  21 |     // Assert RoleManagementPanel is visible
  22 |     await expect(page.getByText('User Role Management')).toBeVisible();
  23 |     // Assert at least one user and one role are listed
  24 |     const rows = await page.locator('tr').count();
  25 |     expect(rows).toBeGreaterThan(1);
  26 |   });
  27 |
  28 |   test('Admin can assign a new role to a user', async ({ page }) => {
  29 |     // Log in as admin (reuse previous steps)
  30 |     await page.goto('/login');
  31 |     await page.fill('input[name="email"]', 'admin@example.com');
  32 |     await page.fill('input[name="password"]', 'adminpassword');
  33 |     await page.click('button[type="submit"]');
> 34 |     await page.waitForURL('**/admin**', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  35 |     // await page.click('a[href="/admin/roles"]'); // Uncomment if needed
  36 |
  37 |     // Wait for RoleManagementPanel
  38 |     await expect(page.getByText('User Role Management')).toBeVisible();
  39 |
  40 |     // Find a user row that does NOT have the 'admin' role (adjust selector as needed)
  41 |     const userRow = page.locator('tr', { hasText: 'Regular User' });
  42 |     await expect(userRow).toBeVisible();
  43 |
  44 |     // Find the role assignment dropdown/select in that row
  45 |     const select = userRow.locator('select');
  46 |     await expect(select).toBeVisible();
  47 |
  48 |     // Assign the 'admin' role (value may be 'r1' or 'admin' depending on your implementation)
  49 |     await select.selectOption({ label: 'admin' });
  50 |
  51 |     // Optionally, click a confirm button if required
  52 |     // await userRow.locator('button', { hasText: 'Assign' }).click();
  53 |
  54 |     // Assert the UI updates: the 'admin' role now appears in the user's row
  55 |     await expect(userRow).toContainText('admin');
  56 |     // Optionally, check for a success message
  57 |     // await expect(page.getByText('Role assigned successfully')).toBeVisible();
  58 |   });
  59 | }); 
```