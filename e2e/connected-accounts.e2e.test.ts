import { test, expect, Page } from '@playwright/test';
import { loginAs } from './utils/auth';

// --- Constants and Test Data --- //
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
const PROFILE_URL = '/profile'; // Adjust if the URL is different

// --- Test Suite --- //
test.describe('Connected Accounts (Account Linking) - Profile Page', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Connected Accounts section is visible in the profile page', async () => {
    // Look for the section heading or a unique element in ConnectedAccounts
    await expect(page.getByRole('heading', { name: /connected accounts/i })).toBeVisible();
    // Optionally, check for provider buttons or linked account list
    // await expect(page.getByRole('button', { name: /link google/i })).toBeVisible();
  });

  test('User can link an OAuth account (placeholder)', async () => {
    // TODO: Implement logic to click the "Link" button for a provider (e.g., Google)
    // and handle the OAuth flow (may require mocking or test provider setup)
    // Example:
    // const linkButton = page.getByRole('button', { name: /link google/i });
    // await linkButton.click();
    // ...handle OAuth popup/redirect...
    // await expect(page.getByText(/google account linked/i)).toBeVisible();
  });

  test('User can unlink an OAuth account (placeholder)', async () => {
    // TODO: Implement logic to click the "Unlink" button for a linked provider
    // Example:
    // const unlinkButton = page.getByRole('button', { name: /unlink google/i });
    // await unlinkButton.click();
    // await expect(page.getByText(/google account unlinked/i)).toBeVisible();
  });
}); 