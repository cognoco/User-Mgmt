import { test, expect } from '@playwright/test';

test.describe('Company Data Export E2E', () => {
  test('Admin can request and download company data export', async ({ page }) => {
    // Login as an admin user (replace with your login helper or flow)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'adminuser@example.com');
    await page.fill('input[name="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/profile');

    // Navigate to profile page (if not redirected)
    await page.goto('/profile');
    await expect(page.getByText('Export Company Data')).toBeVisible();

    // Click the export button
    const exportBtn = page.getByText('Download Company Data');
    await exportBtn.click();
    // Check for success message (download will be triggered in browser)
    await expect(page.getByText('Company data export has been downloaded successfully.')).toBeVisible();
  });
});
