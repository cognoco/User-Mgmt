import { test, expect } from '@playwright/test';

// --- Constants and Test Data --- //
const USER_EMAIL = process.env.E2E_USER_EMAIL || 'user@example.com';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password123';
const LOGIN_URL = '/login';
const DASHBOARD_URL = '/profile'; // Adjust if your app redirects elsewhere after login

// --- Test Suite --- //
test.describe('Login Flow', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    await page.goto(LOGIN_URL);
    // Fill in credentials
    await page.getByLabel(/email/i).fill(USER_EMAIL);
    await page.getByLabel(/password/i).fill(USER_PASSWORD);
    // Click the sign in button
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    // Wait for redirect or user menu/profile
    await page.waitForURL(`**${DASHBOARD_URL}`);
    // Optionally, check for user menu or profile info
    // await expect(page.getByText(/my profile|settings|logout/i)).toBeVisible();
  });

  test('Shows error on invalid credentials', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    // Assert error message is shown
    await expect(page.getByText(/invalid|incorrect|failed|not match/i)).toBeVisible();
  });
}); 