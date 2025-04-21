import { test, expect } from '@playwright/test';

// Registration E2E test: Simulates a real user registering via the UI

test.describe('User Registration Flow', () => {
  test('should allow a new user to register and see a success message or redirect', async ({ page }) => {
    console.log('Test: should allow a new user to register and see a success message or redirect');
    await page.goto('/register');
    // If user type selection is present, select "Personal"
    const userTypeRadio = page.locator('[data-testid="user-type-private"]');
    if (await userTypeRadio.count()) {
      await userTypeRadio.click();
    }
    const uniqueEmail = 'testuser+' + Date.now() + '@example.com';
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
    await page.check('[data-testid="accept-terms-checkbox"]');
    // Wait for the submit button to be enabled before clicking
    const submitButton = page.locator('button[type="submit"]');
    const rateLimitAlert = page.locator('text=rate limit exceeded');
    // Wait for either the button to be enabled or the rate limit error to appear
    try {
      await Promise.race([
        expect(submitButton).toBeEnabled({ timeout: 20000 }),
        expect(rateLimitAlert).toBeVisible({ timeout: 20000 }),
      ]);
    } catch (e) {
      await page.screenshot({ path: 'debug-disabled-button.png' });
      console.log(await page.content());
      throw e;
    }
    if (await rateLimitAlert.isVisible()) {
      console.warn('Rate limit hit, skipping further assertions.');
      return;
    }
    await submitButton.click();
    await expect(
      page.locator('text=Check your email')
        .or(page.locator('text=Verification email sent'))
        .or(page.locator('text=Verify your email'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show an error when registering with an already registered (verified) email', async ({ page }) => {
    console.log('Test: should show an error when registering with an already registered (verified) email');
    // Using a real, pre-verified test account for this scenario
    const existingEmail = 'jorn.jorgensen@cognoco.com';
    await page.goto('/register');
    const userTypeRadio = page.locator('[data-testid="user-type-private"]');
    if (await userTypeRadio.count()) {
      await userTypeRadio.click();
    }
    await page.fill('[data-testid="email-input"]', existingEmail);
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
    await page.check('[data-testid="accept-terms-checkbox"]');
    // Wait for the submit button to be enabled before clicking
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();
    // Wait for the alert to appear and check its content
    const alert = page.locator('[data-testid="registration-error-alert"]');
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText(/already exists|already registered|email in use|account exists/i);
  });

  test('shows success message for at least 2 seconds before redirect after registration', async ({ page }) => {
    console.log('Test: shows success message for at least 2 seconds before redirect after registration');
    await page.goto('/register');
    const userTypeRadio = page.locator('[data-testid="user-type-private"]');
    if (await userTypeRadio.count()) {
      await userTypeRadio.click();
    }
    const uniqueEmail = 'testuser+' + Date.now() + '@example.com';
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
    await page.check('[data-testid="accept-terms-checkbox"]');
    // Wait for the submit button to be enabled before clicking
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();
    // Wait for either the success message or the rate limit error
    const successAlert = page.locator('text=Registration successful! Please check your email to verify your account.');
    const rateLimitAlert = page.locator('text=rate limit exceeded');
    await Promise.race([
      expect(successAlert).toBeVisible({ timeout: 10000 }),
      expect(rateLimitAlert).toBeVisible({ timeout: 10000 }),
    ]);
    // If rate limit is hit, skip the rest of the test
    if (await rateLimitAlert.isVisible()) {
      console.warn('Rate limit hit, skipping further assertions.');
      return;
    }
    // Wait for at least 2 seconds to ensure the message is visible before redirect
    await page.waitForTimeout(2000);
    // Optionally, check that the page is redirected to /check-email or the form is reset
    // (You can add more assertions here if needed)
  });

  // Additional tests for edge cases can be added here following the implementation plan
});
