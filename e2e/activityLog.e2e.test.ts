import { test, expect } from '@playwright/test';

test.describe('Activity Log E2E', () => {
  test('User can view their activity log', async ({ page }) => {
    // Login as a test user (replace with your login helper or flow)
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/account/profile');

    // Navigate to profile page (if not redirected)
    await page.goto('/account/profile');
    await expect(page.getByText('Account Activity Log')).toBeVisible();

    // Should see at least one log entry (if any exist)
    // This will depend on test data in the DB
    // Check for table headers
    await expect(page.getByText('Action')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('IP')).toBeVisible();
    await expect(page.getByText('Device')).toBeVisible();
  });
});
