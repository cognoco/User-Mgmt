import { test, expect, Page } from '@playwright/test';

// Helper: Admin login (replace with your actual login helper if available)
async function adminLogin(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'adminpassword');
  await page.click('button[type="submit"]');
  await page.waitForURL((url: URL) => url.pathname !== '/login');
}

test.describe('Admin Audit Log E2E', () => {
  test('Admin can view and filter audit logs, export, and view details', async ({ page }) => {
    // Login as admin
    await adminLogin(page);

    // Navigate to the admin audit log page (adjust path as needed)
    await page.goto('/admin/audit-logs');
    await expect(page.getByText('Audit Logs')).toBeVisible();

    // Should see at least one log entry (depends on test data)
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Method')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // Filter by method (e.g., DELETE)
    await page.getByLabel('Method').click();
    await page.getByRole('option', { name: 'DELETE' }).click();
    // Optionally, check that filtered results appear (depends on test data)

    // Export as CSV
    await page.getByRole('button', { name: /Export options/i }).click();
    await page.getByRole('menuitem', { name: /Export as CSV/i }).click();
    // Check for export success toast/notification
    await expect(page.getByText(/Export Successful/i)).toBeVisible();

    // Open log details modal
    const logRow = page.getByRole('row', { name: /Log entry from/i }).first();
    await logRow.click();
    await expect(page.getByText(/Log Details/i)).toBeVisible();
    await expect(page.getByText(/Full details for log entry/i)).toBeVisible();
    await page.getByRole('button', { name: /Close details modal/i }).click();
  });

  test('Non-admin is denied access to audit logs', async ({ page }) => {
    // Login as a non-admin user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL((url: URL) => url.pathname !== '/login');

    // Try to access the admin audit log page
    await page.goto('/admin/audit-logs');
    await expect(page.getByText(/Access denied/i)).toBeVisible();
  });

  test('Handles API error gracefully', async ({ page }) => {
    // Login as admin
    await adminLogin(page);
    // Simulate API error by navigating to a special test route or using MSW/playwright mock (if available)
    // For now, just check that error message is shown if API fails
    await page.goto('/admin/audit-logs?simulateError=1');
    await expect(page.getByText(/Failed to fetch audit logs/i)).toBeVisible();
  });
}); 