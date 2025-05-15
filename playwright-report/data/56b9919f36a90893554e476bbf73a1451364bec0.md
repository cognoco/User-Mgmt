# Test info

- Name: Team Management E2E >> Member cannot update seats or remove/invite members
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\team-management.e2e.test.ts:40:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard**" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\team-management.e2e.test.ts:45:16
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
- textbox "Password": memberpassword
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
   3 | // Test users for each role
   4 | const users = {
   5 |   admin: { email: 'admin@example.com', password: 'adminpassword' },
   6 |   member: { email: 'member@example.com', password: 'memberpassword' },
   7 |   viewer: { email: 'viewer@example.com', password: 'viewerpassword' },
   8 |   superadmin: { email: 'superadmin@example.com', password: 'superadminpassword' },
   9 | };
  10 |
  11 | test.describe('Team Management E2E', () => {
  12 |   test('Admin can view, invite, update seats, and remove members', async ({ page }) => {
  13 |     await page.goto('/login');
  14 |     await page.fill('input[name="email"]', users.admin.email);
  15 |     await page.fill('input[name="password"]', users.admin.password);
  16 |     await page.click('button[type="submit"]');
  17 |     await page.waitForURL('**/dashboard**');
  18 |     await page.goto('/team');
  19 |     await expect(page.getByText('Team Management')).toBeVisible();
  20 |     await expect(page.getByText('Admin User')).toBeVisible();
  21 |     await expect(page.getByText('Member User')).toBeVisible();
  22 |     await expect(page.getByText('Viewer User')).toBeVisible();
  23 |     // Update seats
  24 |     await page.click('text=Update Seats');
  25 |     await page.fill('input[type="number"]', '6');
  26 |     await page.click('button:has-text("Update Seats")');
  27 |     await expect(page.getByText('Seats Used: 3 of 6')).toBeVisible();
  28 |     // Remove member
  29 |     const removeButtons = await page.locator('button:has-text("Remove")').all();
  30 |     await removeButtons[1].click();
  31 |     await expect(page.getByText('Successfully removed team member')).toBeVisible();
  32 |     // Invite member
  33 |     await page.click('button:has-text("Invite")');
  34 |     await page.fill('input[name="email"]', 'newuser@example.com');
  35 |     await page.selectOption('select[name="role"]', 'member');
  36 |     await page.click('button:has-text("Send Invite")');
  37 |     await expect(page.getByText('Invite sent successfully')).toBeVisible();
  38 |   });
  39 |
  40 |   test('Member cannot update seats or remove/invite members', async ({ page }) => {
  41 |     await page.goto('/login');
  42 |     await page.fill('input[name="email"]', users.member.email);
  43 |     await page.fill('input[name="password"]', users.member.password);
  44 |     await page.click('button[type="submit"]');
> 45 |     await page.waitForURL('**/dashboard**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  46 |     await page.goto('/team');
  47 |     await expect(page.getByText('Team Management')).toBeVisible();
  48 |     // Should not see Update Seats or Invite buttons
  49 |     await expect(page.getByText('Update Seats')).not.toBeVisible();
  50 |     await expect(page.getByText('Invite')).not.toBeVisible();
  51 |     // Should not see Remove buttons
  52 |     await expect(page.getByText('Remove')).not.toBeVisible();
  53 |   });
  54 |
  55 |   test('Viewer can only view team info', async ({ page }) => {
  56 |     await page.goto('/login');
  57 |     await page.fill('input[name="email"]', users.viewer.email);
  58 |     await page.fill('input[name="password"]', users.viewer.password);
  59 |     await page.click('button[type="submit"]');
  60 |     await page.waitForURL('**/dashboard**');
  61 |     await page.goto('/team');
  62 |     await expect(page.getByText('Team Management')).toBeVisible();
  63 |     await expect(page.getByText('Update Seats')).not.toBeVisible();
  64 |     await expect(page.getByText('Invite')).not.toBeVisible();
  65 |     await expect(page.getByText('Remove')).not.toBeVisible();
  66 |   });
  67 |
  68 |   test('Superadmin can manage any team', async ({ page }) => {
  69 |     await page.goto('/login');
  70 |     await page.fill('input[name="email"]', users.superadmin.email);
  71 |     await page.fill('input[name="password"]', users.superadmin.password);
  72 |     await page.click('button[type="submit"]');
  73 |     await page.waitForURL('**/dashboard**');
  74 |     await page.goto('/team');
  75 |     await expect(page.getByText('Team Management')).toBeVisible();
  76 |     await expect(page.getByText('Update Seats')).toBeVisible();
  77 |     await expect(page.getByText('Invite')).toBeVisible();
  78 |     await expect(page.getByText('Remove')).toBeVisible();
  79 |   });
  80 | });
  81 |
```