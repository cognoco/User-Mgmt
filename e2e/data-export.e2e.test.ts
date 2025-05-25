import { test, expect } from '@playwright/test';
import { loginAs } from './utils/auth';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'testuser@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
const GDPR_SETTINGS_URL = '/settings/gdpr';

test.describe('Personal Data Export E2E', () => {
  test('User can request and download their data export', async ({ page }) => {
    // Log in using shared helper
    await loginAs(page, USER_EMAIL, USER_PASSWORD);

    // Navigate to the GDPR settings page
    await page.goto(GDPR_SETTINGS_URL);
    await page.waitForURL(`**${GDPR_SETTINGS_URL}`);
    await expect(page.getByRole('heading', { name: /privacy & data controls/i })).toBeVisible();

    // Initiate the export
    const exportBtn = page.getByRole('button', { name: /export my data/i });
    await exportBtn.click();

    // Success message should appear once download starts
    await expect(page.getByText(/your data export has been downloaded successfully/i)).toBeVisible();
  });
});
