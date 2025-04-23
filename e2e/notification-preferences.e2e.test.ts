import { test, expect } from '@playwright/test';

test.describe('Notification Preferences E2E', () => {
  test('User can view and update notification preferences', async ({ page }) => {
    // Login as a test user (replace with your login helper or flow)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/profile');

    // Navigate to profile page (if not redirected)
    await page.goto('/profile');
    await expect(page.getByText('Notification Preferences')).toBeVisible();

    // Toggle a preference and save
    const emailCheckbox = page.getByLabel('Email Notifications');
    await expect(emailCheckbox).toBeVisible();
    await emailCheckbox.check();
    const saveBtn = page.getByText('Save Preferences');
    await saveBtn.click();
    await expect(page.getByText('Notification preferences saved successfully.')).toBeVisible();
  });
});
