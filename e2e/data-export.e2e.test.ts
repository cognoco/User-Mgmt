import { test, expect } from '@playwright/test';

test.describe('Personal Data Export E2E', () => {
  test('User can request and download their data export', async ({ page }) => {
    // Login as a test user (replace with your login helper or flow)
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/account/profile');

    // Navigate to profile page (if not redirected)
    await page.goto('/account/profile');
    await expect(page.getByText('Export Your Data')).toBeVisible();

    // Click the export button
    const exportBtn = page.getByText('Download My Data');
    await exportBtn.click();
    // Check for success message (download will be triggered in browser)
    await expect(page.getByText('Your data export has been downloaded successfully.')).toBeVisible();
  });
});
