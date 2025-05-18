import { test, expect } from '@playwright/test';

// E2E: SMS MFA Setup and Management

test.describe('SMS MFA Setup and Management', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is already logged in for this flow (or use a helper)
    await page.goto('/settings/security');
    await page.waitForSelector('[data-testid="mfa-management-section"]', { timeout: 10000 });
  });

  test('User can setup SMS MFA, verify, and remove factor', async ({ page }) => {
    // Start SMS setup
    await page.click('[data-testid="mfa-setup-button"]');
    await page.waitForSelector('[data-testid="mfa-setup-dialog"]', { timeout: 5000 });

    // Select SMS method
    await page.click('[data-testid="mfa-method-sms"]');
    await page.fill('[data-testid="mfa-phone-input"]', '+1234567890');
    await page.click('[data-testid="mfa-send-sms-button"]');

    // Wait for code entry UI
    await page.waitForSelector('[data-testid="mfa-code-input"]', { timeout: 5000 });
    await page.fill('[data-testid="mfa-code-input"]', '654321');
    await page.click('[data-testid="mfa-verify-button"]');

    // Wait for backup codes or success message
    await page.waitForSelector('[data-testid="mfa-backup-codes"]', { timeout: 5000 });
    expect(await page.locator('[data-testid="mfa-backup-codes"]').isVisible()).toBeTruthy();

    // Close setup dialog
    await page.click('[data-testid="mfa-setup-close"]');

    // Check SMS factor is now listed in management UI
    await page.waitForSelector('[data-testid="mfa-factor-sms"]', { timeout: 5000 });
    expect(await page.locator('[data-testid="mfa-factor-sms"]').isVisible()).toBeTruthy();

    // Remove SMS factor
    await page.click('[data-testid="mfa-factor-sms-remove"]');
    await page.waitForSelector('[data-testid="mfa-remove-confirm-dialog"]', { timeout: 3000 });
    await page.click('[data-testid="mfa-remove-confirm"]');

    // Success feedback
    await page.waitForSelector('[role="alert"]', { timeout: 3000 });
    expect(await page.locator('[role="alert"]').textContent()).toMatch(/success|removed|disabled/i);
  });

  test('Shows error for invalid SMS code', async ({ page }) => {
    await page.click('[data-testid="mfa-setup-button"]');
    await page.waitForSelector('[data-testid="mfa-setup-dialog"]', { timeout: 5000 });
    await page.click('[data-testid="mfa-method-sms"]');
    await page.fill('[data-testid="mfa-phone-input"]', '+1234567890');
    await page.click('[data-testid="mfa-send-sms-button"]');
    await page.waitForSelector('[data-testid="mfa-code-input"]', { timeout: 5000 });
    await page.fill('[data-testid="mfa-code-input"]', '000000'); // Invalid code
    await page.click('[data-testid="mfa-verify-button"]');
    // Wait for error alert
    await page.waitForSelector('[role="alert"]', { timeout: 3000 });
    expect(await page.locator('[role="alert"]').textContent()).toMatch(/invalid|expired|error/i);
  });
}); 