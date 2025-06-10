import { Page } from '@playwright/test';

/**
 * Standard user credentials for tests
 */
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'Password123!'
};

/**
 * Logs in a user with the provided credentials
 */
export async function loginUser(page: Page, email = TEST_USER.email, password = TEST_USER.password): Promise<void> {
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Fill in login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  
  // Submit form
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  // Wait for successful navigation to dashboard or profile
  try {
    await Promise.race([
      page.waitForURL('**/profile**', { timeout: 10000 }),
      page.waitForURL('**/dashboard**', { timeout: 10000 })
    ]);
    
    // Small delay to ensure page is fully loaded
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Navigation after login failed, but continuing test');
  }
} 