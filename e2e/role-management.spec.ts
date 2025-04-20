import { test, expect } from '@playwright/test';

// Adjust selectors and URLs as needed for your app

test.describe('Role/Permission Management UI', () => {
  test('Admin can log in and see the Role Management Panel', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill in admin credentials (replace with test admin user)
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard or admin area
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Navigate to Role Management Panel if not default
    // await page.click('a[href="/admin/roles"]'); // Uncomment if needed

    // Assert RoleManagementPanel is visible
    await expect(page.getByText('User Role Management')).toBeVisible();
    // Assert at least one user and one role are listed
    const rows = await page.locator('tr').count();
    expect(rows).toBeGreaterThan(1);
  });

  test('Admin can assign a new role to a user', async ({ page }) => {
    // Log in as admin (reuse previous steps)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });
    // await page.click('a[href="/admin/roles"]'); // Uncomment if needed

    // Wait for RoleManagementPanel
    await expect(page.getByText('User Role Management')).toBeVisible();

    // Find a user row that does NOT have the 'admin' role (adjust selector as needed)
    const userRow = page.locator('tr', { hasText: 'Regular User' });
    await expect(userRow).toBeVisible();

    // Find the role assignment dropdown/select in that row
    const select = userRow.locator('select');
    await expect(select).toBeVisible();

    // Assign the 'admin' role (value may be 'r1' or 'admin' depending on your implementation)
    await select.selectOption({ label: 'admin' });

    // Optionally, click a confirm button if required
    // await userRow.locator('button', { hasText: 'Assign' }).click();

    // Assert the UI updates: the 'admin' role now appears in the user's row
    await expect(userRow).toContainText('admin');
    // Optionally, check for a success message
    // await expect(page.getByText('Role assigned successfully')).toBeVisible();
  });
}); 