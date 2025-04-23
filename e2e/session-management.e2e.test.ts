import { test, expect } from '@playwright/test';

// This test assumes a user can login and access the session management UI
// and that the backend API is connected to Supabase Auth sessions.

test.describe('Session Management E2E', () => {
  test('User can view and revoke sessions', async ({ page }) => {
    // Login as a test user (replace with your login helper or flow)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/profile');

    // Navigate to session management UI
    await page.goto('/profile');
    await expect(page.getByText('Active Sessions')).toBeVisible();

    // Should see at least one session (the current one)
    await expect(page.getByText('(Current)')).toBeVisible();

    // If there are other sessions, try to revoke one
    const revokeButtons = await page.locator('button', { hasText: 'Revoke' });
    if (await revokeButtons.count() > 0) {
      await revokeButtons.first().click();
      // Optionally, check for a success message or that the session disappears
      // await expect(page.getByText('Session revoked')).toBeVisible();
    }
  });
});
