# Test info

- Name: Connected Accounts (Account Linking) - Profile Page >> User can link a GitHub account
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\connected-accounts.e2e.test.ts:40:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeEnabled()

Locator: getByRole('button', { name: /github/i })
Expected: enabled
Received: <element(s) not found>
Call log:
  - expect.toBeEnabled with timeout 5000ms
  - waiting for getByRole('button', { name: /github/i })

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\connected-accounts.e2e.test.ts:47:30
```

# Page snapshot

```yaml
- alert: User not authenticated
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 | import { loginAs } from './utils/auth';
   3 |
   4 | // --- Constants and Test Data --- //
   5 | const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
   6 | const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
   7 | const PROFILE_URL = '/profile'; // Adjust if the URL is different
   8 |
   9 | // --- Test Suite --- //
   10 | test.describe('Connected Accounts (Account Linking) - Profile Page', () => {
   11 |   let page: Page;
   12 |
   13 |   test.beforeEach(async ({ browser }) => {
   14 |     // Use a new page for each test to ensure clean state
   15 |     page = await browser.newPage();
   16 |     // Log in with the test user
   17 |     await loginAs(page, USER_EMAIL, USER_PASSWORD);
   18 |     // Navigate to profile page
   19 |     await page.goto(PROFILE_URL);
   20 |     await page.waitForURL(`**${PROFILE_URL}`);
   21 |   });
   22 |
   23 |   test.afterEach(async () => {
   24 |     await page.close();
   25 |   });
   26 |
   27 |   test('Connected Accounts section is visible in the profile page', async () => {
   28 |     // Look for the section heading
   29 |     const accountsSection = page.getByRole('heading', { name: /connected accounts/i });
   30 |     await expect(accountsSection).toBeVisible();
   31 |
   32 |     // Check that we have connect buttons for OAuth providers
   33 |     const googleButton = page.getByRole('button', { name: /google/i });
   34 |     await expect(googleButton).toBeVisible();
   35 |
   36 |     const githubButton = page.getByRole('button', { name: /github/i });
   37 |     await expect(githubButton).toBeVisible();
   38 |   });
   39 |
   40 |   test('User can link a GitHub account', async () => {
   41 |     // Get the initial count of connected accounts (should be 0 for a new user)
   42 |     const initialAccounts = await page.locator('.flex.items-center.justify-between.p-4.border.rounded-lg').count();
   43 |     console.log(`Initial accounts: ${initialAccounts}`);
   44 |
   45 |     // Find and click the "Link GitHub" button
   46 |     const linkButton = page.getByRole('button', { name: /github/i });
>  47 |     await expect(linkButton).toBeEnabled();
      |                              ^ Error: Timed out 5000ms waiting for expect(locator).toBeEnabled()
   48 |     
   49 |     // Intercept the OAuth redirect
   50 |     await page.route('**/api/auth/oauth/link**', async (route) => {
   51 |       // Mock successful link response
   52 |       await route.fulfill({
   53 |         status: 200,
   54 |         contentType: 'application/json',
   55 |         body: JSON.stringify({
   56 |           success: true,
   57 |           user: { id: 'test-user-id', email: USER_EMAIL },
   58 |           linkedProviders: ['github']
   59 |         })
   60 |       });
   61 |     });
   62 |
   63 |     // Click the link button
   64 |     await linkButton.click();
   65 |
   66 |     // Wait for the API call to complete and the UI to update
   67 |     await page.waitForResponse('**/api/connected-accounts');
   68 |
   69 |     // Verify a new account appears in the list
   70 |     await expect(page.getByText(/github/i).first()).toBeVisible();
   71 |
   72 |     // Check that the "Link GitHub" button is now disabled
   73 |     await expect(linkButton).toBeDisabled();
   74 |   });
   75 |
   76 |   test('User can unlink an OAuth account', async () => {
   77 |     // First, make sure we have a GitHub account linked
   78 |     // Mock the API to return a linked GitHub account
   79 |     await page.route('**/api/connected-accounts', async (route) => {
   80 |       if (route.request().method() === 'GET') {
   81 |         await route.fulfill({
   82 |           status: 200,
   83 |           contentType: 'application/json',
   84 |           body: JSON.stringify([
   85 |             {
   86 |               id: 'github-account-id',
   87 |               provider: 'github',
   88 |               email: 'github@example.com'
   89 |             }
   90 |           ])
   91 |         });
   92 |       } else {
   93 |         await route.continue();
   94 |       }
   95 |     });
   96 |
   97 |     // Refresh the page to show the mocked accounts
   98 |     await page.reload();
   99 |     await page.waitForURL(`**${PROFILE_URL}`);
  100 |
  101 |     // Check that we see the GitHub account
  102 |     const githubAccount = page.getByText('GitHub').first();
  103 |     await expect(githubAccount).toBeVisible();
  104 |
  105 |     // Find the unlink button (trash icon)
  106 |     const unlinkButton = page.getByRole('button', { name: /disconnect github account/i });
  107 |     await expect(unlinkButton).toBeVisible();
  108 |
  109 |     // Intercept the DELETE request
  110 |     await page.route('**/api/connected-accounts**', async (route) => {
  111 |       if (route.request().method() === 'DELETE') {
  112 |         await route.fulfill({
  113 |           status: 200,
  114 |           contentType: 'application/json',
  115 |           body: JSON.stringify({ success: true })
  116 |         });
  117 |       } else {
  118 |         await route.continue();
  119 |       }
  120 |     });
  121 |
  122 |     // Click unlink and wait for response
  123 |     await unlinkButton.click();
  124 |     await page.waitForResponse(response => 
  125 |       response.url().includes('/api/connected-accounts') && 
  126 |       response.request().method() === 'DELETE'
  127 |     );
  128 |
  129 |     // Verify the GitHub account is no longer visible
  130 |     // We need to wait for a short time for the UI to update
  131 |     await expect(githubAccount).not.toBeVisible({ timeout: 5000 });
  132 |     
  133 |     // Verify the GitHub link button is enabled again
  134 |     const linkButton = page.getByRole('button', { name: /github/i });
  135 |     await expect(linkButton).toBeEnabled();
  136 |   });
  137 |
  138 |   test('Handles error when linking an account', async () => {
  139 |     // Mock the API to fail when trying to link an account
  140 |     await page.route('**/api/auth/oauth/link**', async (route) => {
  141 |       await route.fulfill({
  142 |         status: 409,
  143 |         contentType: 'application/json',
  144 |         body: JSON.stringify({
  145 |           error: 'This account is already linked to another user',
  146 |           collision: true
  147 |         })
```