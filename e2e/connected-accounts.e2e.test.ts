import { test, expect, Page } from '@playwright/test';
import { loginAs } from './utils/auth';

// --- Constants and Test Data --- //
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
const PROFILE_URL = '/account/profile'; // Adjust if the URL is different

// --- Test Suite --- //
test.describe('Connected Accounts (Account Linking) - Profile Page', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Use a new page for each test to ensure clean state
    page = await browser.newPage();
    // Log in with the test user
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    // Navigate to profile page
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Connected Accounts section is visible in the profile page', async () => {
    // Look for the section heading
    const accountsSection = page.getByRole('heading', { name: /connected accounts/i });
    await expect(accountsSection).toBeVisible();

    // Check that we have connect buttons for OAuth providers
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();

    const githubButton = page.getByRole('button', { name: /github/i });
    await expect(githubButton).toBeVisible();
  });

  test('User can link a GitHub account', async () => {
    // Get the initial count of connected accounts (should be 0 for a new user)
    const initialAccounts = await page.locator('.flex.items-center.justify-between.p-4.border.rounded-lg').count();
    console.log(`Initial accounts: ${initialAccounts}`);

    // Find and click the "Link GitHub" button
    const linkButton = page.getByRole('button', { name: /github/i });
    await expect(linkButton).toBeEnabled();
    
    // Intercept the OAuth redirect
    await page.route('**/api/auth/oauth/link**', async (route) => {
      // Mock successful link response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'test-user-id', email: USER_EMAIL },
          linkedProviders: ['github']
        })
      });
    });

    // Click the link button
    await linkButton.click();

    // Wait for the API call to complete and the UI to update
    await page.waitForResponse('**/api/connected-accounts');

    // Verify a new account appears in the list
    await expect(page.getByText(/github/i).first()).toBeVisible();

    // Check that the "Link GitHub" button is now disabled
    await expect(linkButton).toBeDisabled();
  });

  test('User can unlink an OAuth account', async () => {
    // First, make sure we have a GitHub account linked
    // Mock the API to return a linked GitHub account
    await page.route('**/api/connected-accounts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'github-account-id',
              provider: 'github',
              email: 'github@example.com'
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Refresh the page to show the mocked accounts
    await page.reload();
    await page.waitForURL(`**${PROFILE_URL}`);

    // Check that we see the GitHub account
    const githubAccount = page.getByText('GitHub').first();
    await expect(githubAccount).toBeVisible();

    // Find the unlink button (trash icon)
    const unlinkButton = page.getByRole('button', { name: /disconnect github account/i });
    await expect(unlinkButton).toBeVisible();

    // Intercept the DELETE request
    await page.route('**/api/connected-accounts**', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      } else {
        await route.continue();
      }
    });

    // Click unlink and wait for response
    await unlinkButton.click();
    await page.waitForResponse(response => 
      response.url().includes('/api/connected-accounts') && 
      response.request().method() === 'DELETE'
    );

    // Verify the GitHub account is no longer visible
    // We need to wait for a short time for the UI to update
    await expect(githubAccount).not.toBeVisible({ timeout: 5000 });
    
    // Verify the GitHub link button is enabled again
    const linkButton = page.getByRole('button', { name: /github/i });
    await expect(linkButton).toBeEnabled();
  });

  test('Handles error when linking an account', async () => {
    // Mock the API to fail when trying to link an account
    await page.route('**/api/auth/oauth/link**', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'This account is already linked to another user',
          collision: true
        })
      });
    });

    // Find and click the "Link GitHub" button
    const linkButton = page.getByRole('button', { name: /github/i });
    await linkButton.click();

    // Check that error message is displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/account is already linked/i);
  });

  test('Handles error when unlinking an account', async () => {
    // First, make sure we have a GitHub account linked
    await page.route('**/api/connected-accounts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'github-account-id',
              provider: 'github',
              email: 'github@example.com'
            }
          ])
        });
      } else {
        await route.continue();
      }
    });

    // Refresh the page to show the mocked accounts
    await page.reload();
    await page.waitForURL(`**${PROFILE_URL}`);

    // Find the unlink button
    const unlinkButton = page.getByRole('button', { name: /disconnect github account/i });
    
    // Mock a failed DELETE request
    await page.route('**/api/connected-accounts**', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Failed to unlink account'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Click unlink
    await unlinkButton.click();

    // Check that error message is displayed
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/failed to unlink account/i);
  });
}); 