import { test, expect } from '@playwright/test';

// --- Constants and Test Data --- //
const REGISTER_URL = '/register';
const USER_EMAIL = 'testuser+' + Date.now() + '@example.com';
const USER_PASSWORD = 'TestPassword123!';

// --- Test Suite --- //
test.describe('Email Verification Flow', () => {
  test('User sees verification prompt after registration', async ({ page }) => {
    await page.goto(REGISTER_URL);
    // If user type selection is present, select "Personal"
    const userTypeRadio = page.locator('[data-testid="user-type-private"]');
    if (await userTypeRadio.count()) {
      await userTypeRadio.click();
    }
    await page.fill('[data-testid="email-input"]', USER_EMAIL);
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="password-input"]', USER_PASSWORD);
    await page.fill('[data-testid="confirm-password-input"]', USER_PASSWORD);
    await page.check('[data-testid="accept-terms-checkbox"]');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();
    // Assert verification prompt is shown
    await expect(
      page.locator('text=Check your email')
        .or(page.locator('text=Verification email sent'))
        .or(page.locator('text=Verify your email'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('User can verify email via link (placeholder)', async () => {
    // TODO: Simulate clicking the verification link in the email
    // This requires email interception/mocking or a test inbox
    // Example:
    // await page.goto('/verify-email?token=...');
    // await expect(page.getByText(/email verified|verification successful/i)).toBeVisible();
    // Optionally, try logging in and assert success
  });
}); 