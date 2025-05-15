# Test info

- Name: Session Management E2E >> User can view and revoke sessions
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\session-management.e2e.test.ts:7:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/profile" until "load"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\session-management.e2e.test.ts:13:16
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
   3 | // This test assumes a user can login and access the session management UI
   4 | // and that the backend API is connected to Supabase Auth sessions.
   5 |
   6 | test.describe('Session Management E2E', () => {
   7 |   test('User can view and revoke sessions', async ({ page }) => {
   8 |     // Login as a test user (replace with your login helper or flow)
   9 |     await page.goto('/login');
  10 |     await page.fill('input[name="email"]', 'testuser@example.com');
  11 |     await page.fill('input[name="password"]', 'password123');
  12 |     await page.click('button[type="submit"]');
> 13 |     await page.waitForURL('/profile');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  14 |
  15 |     // Navigate to session management UI
  16 |     await page.goto('/profile');
  17 |     await expect(page.getByText('Active Sessions')).toBeVisible();
  18 |
  19 |     // Should see at least one session (the current one)
  20 |     await expect(page.getByText('(Current)')).toBeVisible();
  21 |
  22 |     // If there are other sessions, try to revoke one
  23 |     const revokeButtons = await page.locator('button', { hasText: 'Revoke' });
  24 |     if (await revokeButtons.count() > 0) {
  25 |       await revokeButtons.first().click();
  26 |       // Optionally, check for a success message or that the session disappears
  27 |       // await expect(page.getByText('Session revoked')).toBeVisible();
  28 |     }
  29 |   });
  30 | });
  31 |
```