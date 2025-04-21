/**
 * E2E tests for the Role/Permission Management UI in the Admin Panel.
 *
 * These tests cover:
 * - Admin login and navigation to the panel.
 * - Verifying the panel loads with user/role data.
 * - Assigning a role to a user.
 * - Removing a role from a user.
 * - Viewing permissions for a role.
 * - (Future) Testing loading, error, and empty states.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../utils/auth';

// --- Constants and Test Data --- //
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME || 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'password123';
const ROLE_MANAGEMENT_URL = '/admin/roles'; // Adjust if the URL is different
// Optionally, set these via env or test setup for robustness
const TARGET_USER_EMAIL = process.env.E2E_TARGET_USER_EMAIL || 'testuser@example.com';
const ROLE_TO_ASSIGN = process.env.E2E_ROLE_TO_ASSIGN || 'editor';
const ROLE_TO_REMOVE = process.env.E2E_ROLE_TO_REMOVE || 'editor';
const ROLE_TO_VIEW = process.env.E2E_ROLE_TO_VIEW || 'admin';

// --- Test Suite --- //
test.describe('Admin Role/Permission Management', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.goto(ROLE_MANAGEMENT_URL);
    await page.waitForURL(`**${ROLE_MANAGEMENT_URL}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Admin can view the Role Management Panel', async () => {
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
    await expect(userRow).toBeVisible();
    // Find the assign select by ARIA label
    const assignSelect = userRow.locator('select[aria-label^="Assign role to"]');
    await expect(assignSelect).toBeVisible();
    // Assign the role
    await assignSelect.selectOption({ label: ROLE_TO_ASSIGN });
    // Optionally, wait for UI update or success message
    await expect(userRow).toContainText(ROLE_TO_ASSIGN);
  });

  test('Admin can remove a role from a user', async () => {
    // Find the user row by email
    const userRow = page.locator('tr', { hasText: TARGET_USER_EMAIL });
    await expect(userRow).toBeVisible();
    // Find the remove button by ARIA label
    const removeButton = userRow.locator(`button[aria-label^='Remove role ${ROLE_TO_REMOVE}']`);
    await expect(removeButton).toBeVisible();
    await removeButton.click();
    // Optionally, wait for UI update or success message
    await expect(userRow).not.toContainText(ROLE_TO_REMOVE);
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
    await expect(permissionsList.first()).toBeVisible();
  });

  test('Panel shows loading, error, and empty states', async () => {
    // This test is a placeholder. Simulating these states may require test setup/mocking.
    // Example: If you can trigger loading, error, or empty states via test data or API mocks, assert the correct message is shown.
    // await expect(page.getByText('Loading...')).toBeVisible();
    // await expect(page.getByText('No users found.')).toBeVisible();
    // await expect(page.getByText(/error/i)).toBeVisible();
  });

  // TODO: Add accessibility and responsiveness checks as needed
}); 