import { test, expect } from '@playwright/test';

const backupCodes = [
  'ABCD-1234',
  'EFGH-5678',
  'IJKL-9012',
  'MNOP-3456',
  'QRST-7890',
  'UVWX-2345',
  'YZAB-6789',
  'CDEF-0123',
  'GHIJ-4567',
  'KLMN-8901',
];

test.describe('Backup Codes E2E', () => {
  test('User can generate, download, and regenerate backup codes in settings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    await page.goto('/settings/security');
    await page.click('text=View Backup Codes');
    for (const code of backupCodes) {
      await expect(page.getByText(code)).toBeVisible();
    }
    await page.click('text=Download');
    await page.click('text=Copy');
    await page.click('text=Regenerate');
    for (const code of backupCodes) {
      await expect(page.getByText(code)).toBeVisible();
    }
  });

  test('User can use a backup code to log in when 2FA is required', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/mfa**');
    await page.click('text=Use Backup Code');
    await page.fill('input[placeholder="XXXX-XXXX"]', backupCodes[0]);
    await page.click('button:has-text("Verify")');
    await expect(page.getByText(/success|dashboard|welcome/i)).toBeVisible();
  });

  test('Shows error for invalid backup code', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/mfa**');
    await page.click('text=Use Backup Code');
    await page.fill('input[placeholder="XXXX-XXXX"]', 'WRONG-0000');
    await page.click('button:has-text("Verify")');
    await expect(page.getByText(/invalid backup code|failed to verify/i)).toBeVisible();
  });
});
