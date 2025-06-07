import { test, expect, Page } from '@playwright/test';
import { loginUser } from '@/e2e/utils/authUtils';

// Helper to register a user via UI
async function registerUser(page: Page, email: string, password: string) {
  await page.goto('/auth/register');
  await page.getByLabel(/first name/i).fill('Test');
  await page.getByLabel(/last name/i).fill('User');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  const terms = page.getByRole('checkbox');
  if (await terms.isVisible()) await terms.check();
  await page.getByRole('button', { name: /sign up|register/i }).click();
  // Wait for check email page
  await page.waitForURL('**check-email**');
}

// Helper to simulate verifying email
async function verifyEmail(page: Page, email: string) {
  const token = 'test-token-' + Date.now();
  await page.goto(`/auth/verify-email?token=${token}`);
  await expect(page.url()).toContain('/auth/verify-email');
  // backend should mark email verified
  const resp = await page.request.post('/api/auth/verify-email', {
    data: { token }
  });
  expect(resp.ok()).toBeTruthy();
}

// Helper to request password reset and set new password
async function resetPassword(page: Page, email: string, newPassword: string) {
  await page.goto('/auth/reset-password');
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole('button', { name: /send/i }).click();
  // Assume token is returned via API
  const token = 'reset-token-' + Date.now();
  await page.goto(`/auth/update-password?token=${token}`);
  await page.getByLabel(/^new password$/i).fill(newPassword);
  await page.getByLabel(/confirm new password/i).fill(newPassword);
  await page.getByRole('button', { name: /update|reset/i }).click();
  await page.waitForURL('**login**');
}

// Helper to enable MFA
async function enableMfa(page: Page) {
  await page.goto('/settings/security');
  const enableBtn = page.getByRole('button', { name: /enable.*authenticator/i });
  if (await enableBtn.isVisible()) {
    await enableBtn.click();
    const setupCode = page.getByText(/verification code/i);
    if (await setupCode.isVisible()) {
      await page.getByRole('button', { name: /continue|confirm/i }).click();
    }
  }
}

// MFA login helper
async function loginWithMfa(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  // MFA code entry
  const codeField = page.getByLabel(/authenticator code/i);
  if (await codeField.isVisible()) {
    await codeField.fill('123456');
    await page.getByRole('button', { name: /verify/i }).click();
  }
  await page.waitForURL('**dashboard**');
}

// OAuth login helper (mocked)
async function loginWithOAuth(page: Page, provider: string) {
  await page.goto('/auth/login');
  const btn = page.getByRole('button', { name: new RegExp(provider, 'i') });
  await btn.click();
  const callbackUrl = `/auth/callback?code=mock&provider=${provider}`;
  await page.goto(callbackUrl);
  await page.waitForURL('**dashboard**');
}

test.describe('Full Authentication Flows', () => {
  const baseEmail = `flowuser+${Date.now()}@example.com`;
  const password = 'FlowPassword123!';

  test('Registration, email verification and initial login', async ({ page }) => {
    await registerUser(page, baseEmail, password);
    await verifyEmail(page, baseEmail);
    await loginUser(page, baseEmail, password);
    await expect(page.url()).toContain('/dashboard');
  });

  test('Password reset flow', async ({ page }) => {
    await resetPassword(page, baseEmail, password + 'New');
    await loginUser(page, baseEmail, password + 'New');
    await expect(page.url()).toContain('/dashboard');
  });

  test('MFA setup and verification on login', async ({ page }) => {
    await loginUser(page, baseEmail, password + 'New');
    await enableMfa(page);
    await page.getByRole('button', { name: /log out/i }).click();
    await loginWithMfa(page, baseEmail, password + 'New');
    await expect(page.url()).toContain('/dashboard');
  });

  test('OAuth authentication', async ({ page }) => {
    await loginWithOAuth(page, 'google');
    await expect(page.url()).toContain('/dashboard');
  });

  test('Session management and logout', async ({ page, browser }) => {
    await loginUser(page, baseEmail, password + 'New');
    await page.goto('/account/profile');
    const sessionTable = page.locator('table').filter({ hasText: /session/i });
    await expect(sessionTable).toBeVisible();
    await page.getByRole('button', { name: /log out/i }).click();
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/dashboard');
    await expect(newPage).toHaveURL(/login/);
    await newContext.close();
  });
});
