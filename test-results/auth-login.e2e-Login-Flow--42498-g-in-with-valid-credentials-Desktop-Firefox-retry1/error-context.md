# Test info

- Name: Login Flow >> User can log in with valid credentials
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\login.e2e.test.ts:11:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel(/password/i) resolved to 2 elements:
    1) <input id="password" type="password" name="password" aria-invalid="false" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/> aka getByRole('textbox', { name: 'Password' })
    2) <button type="button" aria-label="Show password" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground absolute right-1 top-1 h-7 w-7">…</button> aka getByRole('button', { name: 'Show password' })

Call log:
  - waiting for getByLabel(/password/i)

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\login.e2e.test.ts:15:40
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // --- Constants and Test Data --- //
   4 | const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
   5 | const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
   6 | const LOGIN_URL = '/login';
   7 | const DASHBOARD_URL = '/profile'; // Adjust if your app redirects elsewhere after login
   8 |
   9 | // --- Test Suite --- //
  10 | test.describe('Login Flow', () => {
  11 |   test('User can log in with valid credentials', async ({ page }) => {
  12 |     await page.goto(LOGIN_URL);
  13 |     // Fill in credentials
  14 |     await page.getByLabel(/email/i).fill(USER_EMAIL);
> 15 |     await page.getByLabel(/password/i).fill(USER_PASSWORD);
     |                                        ^ Error: locator.fill: Error: strict mode violation: getByLabel(/password/i) resolved to 2 elements:
  16 |     // Click the sign in button
  17 |     await page.getByRole('button', { name: /sign in|log in/i }).click();
  18 |     // Wait for redirect or user menu/profile
  19 |     await page.waitForURL(`**${DASHBOARD_URL}`);
  20 |     // Optionally, check for user menu or profile info
  21 |     // await expect(page.getByText(/my profile|settings|logout/i)).toBeVisible();
  22 |   });
  23 |
  24 |   test('Shows error on invalid credentials', async ({ page }) => {
  25 |     await page.goto(LOGIN_URL);
  26 |     await page.getByLabel(/email/i).fill('invalid@example.com');
  27 |     await page.getByLabel(/password/i).fill('wrongpassword');
  28 |     await page.getByRole('button', { name: /sign in|log in/i }).click();
  29 |     // Assert error message is shown
  30 |     await expect(page.getByText(/invalid|incorrect|failed|not match/i)).toBeVisible();
  31 |   });
  32 | }); 
```