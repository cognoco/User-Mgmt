import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard for users with admin role', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('**/dashboard');
    
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
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
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
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
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