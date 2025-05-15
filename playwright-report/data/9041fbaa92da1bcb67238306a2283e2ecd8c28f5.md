# Test info

- Name: Admin Audit Log E2E >> Handles API error gracefully
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\admin\audit-log.e2e.test.ts:58:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
    at adminLogin (C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\admin\audit-log.e2e.test.ts:9:14)
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\admin\audit-log.e2e.test.ts:60:5
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
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // Helper: Admin login (replace with your actual login helper if available)
   4 | async function adminLogin(page: Page) {
   5 |   await page.goto('/login');
   6 |   await page.fill('input[name="email"]', 'admin@example.com');
   7 |   await page.fill('input[name="password"]', 'adminpassword');
   8 |   await page.click('button[type="submit"]');
>  9 |   await page.waitForURL((url: URL) => url.pathname !== '/login');
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  10 | }
  11 |
  12 | test.describe('Admin Audit Log E2E', () => {
  13 |   test('Admin can view and filter audit logs, export, and view details', async ({ page }) => {
  14 |     // Login as admin
  15 |     await adminLogin(page);
  16 |
  17 |     // Navigate to the admin audit log page (adjust path as needed)
  18 |     await page.goto('/admin/audit-logs');
  19 |     await expect(page.getByText('Audit Logs')).toBeVisible();
  20 |
  21 |     // Should see at least one log entry (depends on test data)
  22 |     await expect(page.getByRole('table')).toBeVisible();
  23 |     await expect(page.getByText('Method')).toBeVisible();
  24 |     await expect(page.getByText('Status')).toBeVisible();
  25 |
  26 |     // Filter by method (e.g., DELETE)
  27 |     await page.getByLabel('Method').click();
  28 |     await page.getByRole('option', { name: 'DELETE' }).click();
  29 |     // Optionally, check that filtered results appear (depends on test data)
  30 |
  31 |     // Export as CSV
  32 |     await page.getByRole('button', { name: /Export options/i }).click();
  33 |     await page.getByRole('menuitem', { name: /Export as CSV/i }).click();
  34 |     // Check for export success toast/notification
  35 |     await expect(page.getByText(/Export Successful/i)).toBeVisible();
  36 |
  37 |     // Open log details modal
  38 |     const logRow = page.getByRole('row', { name: /Log entry from/i }).first();
  39 |     await logRow.click();
  40 |     await expect(page.getByText(/Log Details/i)).toBeVisible();
  41 |     await expect(page.getByText(/Full details for log entry/i)).toBeVisible();
  42 |     await page.getByRole('button', { name: /Close details modal/i }).click();
  43 |   });
  44 |
  45 |   test('Non-admin is denied access to audit logs', async ({ page }) => {
  46 |     // Login as a non-admin user
  47 |     await page.goto('/login');
  48 |     await page.fill('input[name="email"]', 'user@example.com');
  49 |     await page.fill('input[name="password"]', 'userpassword');
  50 |     await page.click('button[type="submit"]');
  51 |     await page.waitForURL((url: URL) => url.pathname !== '/login');
  52 |
  53 |     // Try to access the admin audit log page
  54 |     await page.goto('/admin/audit-logs');
  55 |     await expect(page.getByText(/Access denied/i)).toBeVisible();
  56 |   });
  57 |
  58 |   test('Handles API error gracefully', async ({ page }) => {
  59 |     // Login as admin
  60 |     await adminLogin(page);
  61 |     // Simulate API error by navigating to a special test route or using MSW/playwright mock (if available)
  62 |     // For now, just check that error message is shown if API fails
  63 |     await page.goto('/admin/audit-logs?simulateError=1');
  64 |     await expect(page.getByText(/Failed to fetch audit logs/i)).toBeVisible();
  65 |   });
  66 | }); 
```