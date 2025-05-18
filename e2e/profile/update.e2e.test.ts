import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../utils/auth';

// --- Constants and Test Data --- //
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
const PROFILE_URL = '/profile'; // Adjust if the URL is different
const NEW_FIRST_NAME = 'E2ETestFirstName';

// --- Test Suite --- //
test.describe('Profile Update Flow', () => {
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

  test('User can update their profile information', async () => {
    // Find the first name input (adjust selector as needed)
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i], [data-testid="firstName-input"]');
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill(NEW_FIRST_NAME);

    // Find and click the save button (adjust selector as needed)
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Optionally, wait for a success message
    // await expect(page.getByText(/profile updated/i)).toBeVisible();

    // Reload and verify the change persists
    await page.reload();
    await expect(firstNameInput).toHaveValue(NEW_FIRST_NAME);
  });

  test('User can upload an avatar (placeholder)', async () => {
    // TODO: Implement avatar upload logic
    // Example:
    // const uploadInput = page.locator('input[type="file"][accept*="image"], [data-testid="avatar-upload"]');
    // await uploadInput.setInputFiles('path/to/test-avatar.png');
    // await expect(page.getByAltText(/avatar/i)).toBeVisible();
  });

  test('User can toggle privacy settings (placeholder)', async () => {
    // TODO: Implement privacy toggle logic
    // Example:
    // const privacyToggle = page.getByRole('checkbox', { name: /public profile/i });
    // await privacyToggle.check();
    // await expect(privacyToggle).toBeChecked();
  });
}); 