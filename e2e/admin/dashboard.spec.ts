import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard for users with admin role', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    
    // Wait for the login form to be fully loaded
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    
    // Fill the form with proper timing
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('Password123!');
    
    // Wait a moment for form validation to complete
    await page.waitForTimeout(500);
    
    // Submit the form
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for login to complete or handle any validation errors
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (timeoutError) {
      // If login fails, check for error messages to provide better debugging
      const errorAlert = page.locator('[role="alert"]').filter({ hasText: 'Login Failed' });
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        console.log('Login error:', errorText);
      }
      throw timeoutError;
    }
    
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    
    // Verify dashboard components are visible
    await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
    await expect(page.locator('text=Team Overview')).toBeVisible();
    await expect(page.locator('text=Subscription Status')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Verify team stats cards are present
    await expect(page.locator('text=Total Members')).toBeVisible();
    await expect(page.locator('text=Active Members')).toBeVisible();
    await expect(page.locator('text=Pending Invites')).toBeVisible();
    await expect(page.locator('text=Seat Usage')).toBeVisible();
    
    // Verify action buttons
    await expect(page.locator('a:has-text("Manage Team")')).toBeVisible();
    await expect(page.locator('a:has-text("Organization Settings")')).toBeVisible();
  });

  test('should redirect non-admin users attempting to access admin dashboard', async ({ page }) => {
    // Login as regular user
    await page.goto('/auth/login');
    
    // Wait for the login form to be fully loaded
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    await page.locator('#email').fill('user@example.com');
    await page.locator('#password').fill('Password123!');
    
    // Wait for form validation
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for login to complete
    await page.waitForURL('**/dashboard');
    
    // Attempt to navigate to admin dashboard
    await page.goto('/admin/dashboard');
    
    // Verify redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('should load dashboard data correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    
    // Wait for the login form to be fully loaded
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill('Password123!');
    
    // Wait for form validation
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for login to complete
    await page.waitForURL('**/dashboard');
    
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    
    // Wait for dashboard data to load (skeletons to disappear)
    await page.waitForSelector('.animate-pulse', { state: 'detached' });
    
    // Verify dashboard displays actual data (numbers in cards)
    const statCards = await page.locator('.text-2xl.font-bold').all();
    for (const card of statCards) {
      const text = await card.textContent();
      // Check if the card contains numeric data
      if (text) {
        expect(/\d+/.test(text) || /\d+\/\d+/.test(text)).toBeTruthy();
      }
    }
    
    // Check for subscription info
    await expect(page.locator('text=Current Plan')).toBeVisible();
  });
}); 