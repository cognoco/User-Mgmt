import { test, expect } from '@playwright/test';

// These tests assume a test user is already logged in and on the profile page
// and that the backend is set up to mock or accept verification requests.

test.describe('Profile Verification UI', () => {
  test('User can request verification without document upload', async ({ page }) => {
    // Go to profile page
    await page.goto('/account/profile');
    // Wait for the ProfileVerification UI
    await expect(page.getByText('Profile Verification')).toBeVisible();
    // Should show unverified status and request button
    await expect(page.getByText(/not verified/i)).toBeVisible();
    const requestBtn = page.getByRole('button', { name: /request verification/i });
    await expect(requestBtn).toBeVisible();
    // Click request
    await requestBtn.click();
    // Simulate backend response: status becomes pending
    await expect(page.getByText(/pending review/i)).toBeVisible();
    // Request button should disappear
    await expect(page.getByRole('button', { name: /request verification/i })).not.toBeVisible();
  });

  test('User can request verification with document upload enabled', async ({ page }) => {
    // Go to profile page with document upload enabled (assume feature flag or prop is set in test env)
    await page.goto('/profile?docUpload=1'); // Or however the feature is toggled in your test setup
    await expect(page.getByText('Profile Verification')).toBeVisible();
    // Should show upload field
    const fileInput = page.locator('[aria-label*="upload supporting document" i], [data-testid="document-upload"]');
    await expect(fileInput).toBeVisible();
    // Simulate file selection (mock file)
    await fileInput.setInputFiles({ name: 'testdoc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('dummy') });
    // Click request
    const requestBtn = page.getByRole('button', { name: /request verification/i });
    await requestBtn.click();
    // Simulate backend response: status becomes pending
    await expect(page.getByText(/pending review/i)).toBeVisible();
  });

  test('Rejected status and admin feedback are shown', async ({ page }) => {
    // Simulate backend returns rejected status with feedback
    await page.goto('/profile?mockRejected=1'); // Assume test env or MSW returns rejected
    await expect(page.getByText('Profile Verification')).toBeVisible();
    await expect(page.getByText(/rejected/i)).toBeVisible();
    await expect(page.getByText(/reason/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /request verification/i })).toBeVisible();
  });

  test('Verified status is shown', async ({ page }) => {
    // Simulate backend returns verified status
    await page.goto('/profile?mockVerified=1'); // Assume test env or MSW returns verified
    await expect(page.getByText('Profile Verification')).toBeVisible();
    await expect(page.getByText(/verified/i)).toBeVisible();
    await expect(page.getByText(/your profile is verified/i)).toBeVisible();
  });
}); 