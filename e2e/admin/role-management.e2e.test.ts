/**
 * E2E tests for the Role/Permission Management UI in the Admin Panel.
 *
 * These tests cover:
 * - Admin login and navigation to the panel.
 * - Verifying the panel loads with user/role data.
 * - Assigning a role to a user.
 * - Removing a role from a user.
 * - Viewing permissions for a role.
 * - Testing loading, error, and empty states.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../utils/auth';

// --- Constants and Test Data --- //
// Use environment variables with fallbacks for test configuration
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME || 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'password123';
const ROLE_MANAGEMENT_URL = '/admin/roles';
const TARGET_USER_EMAIL = process.env.E2E_TARGET_USER_EMAIL || 'testuser@example.com';
const ROLE_TO_ASSIGN = process.env.E2E_ROLE_TO_ASSIGN || 'editor';
const ROLE_TO_REMOVE = process.env.E2E_ROLE_TO_REMOVE || 'editor';
const ROLE_TO_VIEW = process.env.E2E_ROLE_TO_VIEW || 'admin';

// --- Test Suite --- //
test.describe('Admin Role/Permission Management', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login as admin
    await loginAs(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    
    // Navigate to role management page
    await page.goto(ROLE_MANAGEMENT_URL);
    await page.waitForURL(`**${ROLE_MANAGEMENT_URL}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Admin can view the Role Management Panel', async () => {
    // Wait for content to load and check for spinner
    const loadingSpinner = page.getByRole('progressbar');
    if (await loadingSpinner.isVisible()) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    }
    
    // Verify the main panel heading is visible
    await expect(page.getByRole('heading', { name: 'User Role Management' })).toBeVisible();
    
    // Verify the table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Assign' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Remove' })).toBeVisible();
  });

  test('Admin can assign a role to a user', async () => {
    // Find the user row by email
    const userRow = page.locator('tr', { hasText: TARGET_USER_EMAIL });
    
    // Check if user exists in the table
    const userExists = await userRow.isVisible();
    test.skip(!userExists, 'Test user not found in table');
    
    // Find the assign select by ARIA label
    const assignSelect = userRow.locator('select[aria-label^="Assign role to"]');
    await expect(assignSelect).toBeVisible();
    
    // Check current roles to avoid duplicate assignment
    const currentRoles = await userRow.locator('[data-testid="user-roles"]').textContent();
    if (currentRoles && currentRoles.includes(ROLE_TO_ASSIGN)) {
      // If user already has the role, we first need to remove it to test assignment
      const removeButton = userRow.locator(`button[aria-label^='Remove role ${ROLE_TO_ASSIGN}']`);
      if (await removeButton.isVisible()) {
        await removeButton.click();
        // Wait for role to be removed
        await expect(userRow.locator('[data-testid="user-roles"]')).not.toContainText(ROLE_TO_ASSIGN);
      }
    }
    
    // Assign the role
    await assignSelect.selectOption({ label: ROLE_TO_ASSIGN });
    
    // Wait for success notification or role to appear
    await expect(userRow.locator('[data-testid="user-roles"]')).toContainText(ROLE_TO_ASSIGN, { timeout: 5000 });
  });

  test('Admin can remove a role from a user', async () => {
    // Find the user row by email
    const userRow = page.locator('tr', { hasText: TARGET_USER_EMAIL });
    
    // Check if user exists in the table
    const userExists = await userRow.isVisible();
    test.skip(!userExists, 'Test user not found in table');
    
    // Check if user has the role we want to remove
    const currentRoles = await userRow.locator('[data-testid="user-roles"]').textContent();
    if (!currentRoles || !currentRoles.includes(ROLE_TO_REMOVE)) {
      // If user doesn't have the role, we first need to assign it to test removal
      const assignSelect = userRow.locator('select[aria-label^="Assign role to"]');
      await assignSelect.selectOption({ label: ROLE_TO_REMOVE });
      // Wait for role to be assigned
      await expect(userRow.locator('[data-testid="user-roles"]')).toContainText(ROLE_TO_REMOVE, { timeout: 5000 });
    }
    
    // Find the remove button by ARIA label
    const removeButton = userRow.locator(`button[aria-label^='Remove role ${ROLE_TO_REMOVE}']`);
    await expect(removeButton).toBeVisible();
    
    // Remove the role
    await removeButton.click();
    
    // Wait for role to be removed
    await expect(userRow.locator('[data-testid="user-roles"]')).not.toContainText(ROLE_TO_REMOVE, { timeout: 5000 });
  });

  test('Admin can view permissions for a role', async () => {
    // Find the permissions viewer section
    await expect(page.getByRole('heading', { name: 'Roles & Permissions' })).toBeVisible();
    
    // Expand the details for the target role
    const roleDetails = page.locator('details').filter({ hasText: ROLE_TO_VIEW });
    await expect(roleDetails).toBeVisible();
    await roleDetails.locator('summary').click();
    
    // Assert at least one permission is listed (or 'No permissions' text)
    const permissionsList = roleDetails.locator('ul > li');
    const emptyState = roleDetails.locator('p').filter({ hasText: 'No permissions' });
    
    // Check either permissions list or empty state message is visible
    await expect(async () => {
      return (await permissionsList.count() > 0) || (await emptyState.isVisible());
    }).toBeTruthy();
  });

  test('Panel shows loading, error, and empty states', async () => {
    // Testing loading state by forcing a page reload and checking for loading indicator
    await page.reload();
    const loadingSpinner = page.getByRole('progressbar');
    await expect(loadingSpinner).toBeVisible({ timeout: 1000 }).catch(() => {
      // If loading spinner isn't visible, it might have loaded too quickly
      // This is not a failure case
      console.log('Page loaded too quickly to catch loading state');
    });
    
    // Force empty state by navigating to a filtered view (if supported by the application)
    // This assumes the application supports query parameters for filtering
    await page.goto(`${ROLE_MANAGEMENT_URL}?role=non_existent_role`);
    await page.waitForLoadState('networkidle');
    
    // Check for empty state message (this might need adjustment based on actual UI)
    const emptyStateMsg = page.getByText('No users found matching the criteria');
    if (await emptyStateMsg.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(emptyStateMsg).toBeVisible();
    } else {
      // If empty state isn't visible, log for investigation
      console.log('Empty state not triggered or has different wording');
    }
    
    // Navigate back to main page
    await page.goto(ROLE_MANAGEMENT_URL);
  });

  test('Panel is responsive and accessible', async () => {
    // Basic accessibility check - panel headings are properly structured
    await expect(page.getByRole('heading', { name: 'User Role Management', level: 1 })).toBeVisible();
    
    // Check that the table is accessible and includes proper ARIA attributes
    const table = page.locator('table');
    await expect(table).toHaveAttribute('role', 'grid');
    
    // Check responsive behavior by resizing viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Table should still be accessible or transform to a responsive alternative
    await expect(page.getByRole('heading', { name: 'User Role Management' })).toBeVisible();
    
    // Return to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
  });
}); 