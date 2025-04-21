import { test, expect } from '@playwright/test';

// --- Constants and Test Data --- //
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const FORGOT_PASSWORD_URL = '/forgot-password';

// --- Test Suite --- //
test.describe('Password Recovery (Forgot Password) Flow', () => {
  test('User can request a password reset with a valid email', async ({ page }) => {
    await page.goto(FORGOT_PASSWORD_URL);
    await page.getByLabel(/email/i).fill(USER_EMAIL);
    await page.getByRole('button', { name: /reset|send|submit/i }).click();
    // Assert success message is shown
    await expect(page.getByText(/check your email|reset link sent|email sent/i)).toBeVisible();
  });

  test('Shows error or info on invalid/unregistered email', async ({ page }) => {
    await page.goto(FORGOT_PASSWORD_URL);
    await page.getByLabel(/email/i).fill('notarealuser@example.com');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();
    // Assert error or info message is shown
    await expect(page.getByText(/not found|no account|invalid|sent if exists/i)).toBeVisible();
  });

  test('User can reset password via email link (placeholder)', async () => {
    // TODO: Simulate clicking the reset link in the email and setting a new password
    // This requires email interception/mocking or a test inbox
    // Example:
    // await page.goto('/reset-password?token=...');
    // await page.getByLabel(/new password/i).fill('NewPassword123!');
    // await page.getByLabel(/confirm password/i).fill('NewPassword123!');
    // await page.getByRole('button', { name: /reset|submit/i }).click();
    // await expect(page.getByText(/password updated|reset successful/i)).toBeVisible();
  });
}); 