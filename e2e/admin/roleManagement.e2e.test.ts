/**
 * E2E tests for the Role/Permission Management UI in the Admin Panel.
 *
 * These tests cover features 6.4 (Assign/Update Role) and 6.6 (Role Definition/RBAC)
 * from the Phase 6 User Management System functionality document.
 *
 * Tests cover:
 * - Admin login and navigation to the panel
 * - Verifying the panel loads with user/role data
 * - Assigning a role to a user
 * - Removing a role from a user
 * - Viewing permissions for a role
 * - Testing loading, error, and empty states
 * - Verifying accessibility and responsiveness
 */
import { test, expect } from '@playwright/test';

// --- Test Suite --- //
test.describe('Admin Role/Permission Management', () => {
  // Admin credentials
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Password123!';
  
  // Regular user credentials for role updates
  const targetUserEmail = 'user@example.com';
  
  // Setup: Login as admin before each test
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/auth/login');
    
    // Fill in admin credentials
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for login to complete and redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('Admin can access admin dashboard', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    
    // Verify the admin dashboard is accessible
    await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
    
    // Verify there's a link to the role management page
    const roleManagementLink = page.locator('a:has-text("Role Management")');
    await expect(roleManagementLink).toBeVisible();
    
    // Click on the role management link
    await roleManagementLink.click();
    
    // Verify we've navigated to the roles page
    await expect(page).toHaveURL(/\/admin\/roles$/);
  });

  test('Admin can view the Role Management Panel', async ({ page }) => {
    // Navigate directly to the role management page
    await page.goto('/admin/roles');
    
    // Verify the page title is visible
    await expect(page.locator('h1:has-text("Role Management")')).toBeVisible();
    
    // Verify the description text
    await expect(page.locator('text=Assign roles and manage permissions for users')).toBeVisible();
    
    // Verify the user role management table is present
    await expect(page.locator('h2:has-text("User Role Management")')).toBeVisible();
    
    // Verify table headers
    const headers = ['Name', 'Email', 'Roles', 'Assign', 'Remove'];
    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
    
    // Verify the Roles & Permissions section is present
    await expect(page.locator('h3:has-text("Roles & Permissions")')).toBeVisible();
    
    // Wait for any loading skeletons to disappear
    await page.waitForSelector('.skeleton', { state: 'detached' });
    
    // Verify at least one user is displayed in the table
    const userRowCount = await page.locator('tbody tr').count();
    expect(userRowCount).toBeGreaterThan(0);
  });

  test('Admin can assign a role to a user', async ({ page }) => {
    // Navigate directly to the role management page
    await page.goto('/admin/roles');
    
    // Wait for any loading indicators to disappear
    await page.waitForSelector('.text-center >> text=Loading...', { state: 'detached' });
    
    // Find the target user row
    const userRow = page.locator(`tr:has-text("${targetUserEmail}")`);
    await expect(userRow).toBeVisible();
    
    // Check initial roles (may be "None" or existing roles)
    const initialRolesCell = userRow.locator('td:nth-child(3)');
    const initialRolesText = await initialRolesCell.innerText();
    
    // Find the role dropdown for the target user
    const roleDropdown = userRow.locator('select[aria-label*="Assign role"]');
    await expect(roleDropdown).toBeVisible();
    
    // Select "Viewer" role from dropdown
    await roleDropdown.selectOption({ label: 'Viewer' });
    
    // Wait for the assignment to complete (should update the UI)
    // Either look for a success message or wait for role to appear
    await expect(userRow.locator('td:nth-child(3) li:has-text("Viewer")')).toBeVisible({ timeout: 5000 });
    
    // Verify the role has been added
    const updatedRolesCell = userRow.locator('td:nth-child(3)');
    const updatedRolesText = await updatedRolesCell.innerText();
    expect(updatedRolesText).toContain('Viewer');
    expect(updatedRolesText).not.toBe(initialRolesText);
  });

  test('Admin can remove a role from a user', async ({ page }) => {
    // Navigate directly to the role management page
    await page.goto('/admin/roles');
    
    // Wait for any loading indicators to disappear
    await page.waitForSelector('.text-center >> text=Loading...', { state: 'detached' });
    
    // Find the target user row
    const userRow = page.locator(`tr:has-text("${targetUserEmail}")`);
    await expect(userRow).toBeVisible();
    
    // Check that the user has at least one role with a "Remove" button
    const removeButton = userRow.locator('button:has-text("Remove")').first();
    
    // If no remove button is present, we need to assign a role first
    if (await removeButton.count() === 0) {
      console.log('No roles to remove, assigning a role first...');
      
      // Find the role dropdown for the target user
      const roleDropdown = userRow.locator('select[aria-label*="Assign role"]');
      await expect(roleDropdown).toBeVisible();
      
      // Select "Viewer" role from dropdown
      await roleDropdown.selectOption({ label: 'Viewer' });
      
      // Wait for the assignment to complete
      await expect(userRow.locator('td:nth-child(3) li:has-text("Viewer")')).toBeVisible({ timeout: 5000 });
    }
    
    // Get the initial roles
    const initialRolesCell = userRow.locator('td:nth-child(3)');
    const initialRolesText = await initialRolesCell.innerText();
    
    // Now click the remove button (which should now exist)
    const finalRemoveButton = userRow.locator('button:has-text("Remove")').first();
    await expect(finalRemoveButton).toBeVisible();
    await finalRemoveButton.click();
    
    // Wait for the role to be removed (UI should update)
    await page.waitForTimeout(1000); // Small delay to allow for removal animation/update
    
    // Verify the role has been removed
    const updatedRolesCell = userRow.locator('td:nth-child(3)');
    const updatedRolesText = await updatedRolesCell.innerText();
    
    // Either the role text should change or it should show "None"
    expect(updatedRolesText !== initialRolesText || updatedRolesText.includes('None')).toBeTruthy();
  });

  test('Admin can view permissions for a role', async ({ page }) => {
    // Navigate directly to the role management page
    await page.goto('/admin/roles');
    
    // Wait for any loading indicators to disappear
    await page.waitForSelector('.text-center >> text=Loading...', { state: 'detached' });
    
    // Check for the Roles & Permissions section
    await expect(page.locator('h3:has-text("Roles & Permissions")')).toBeVisible();
    
    // Find the Admin role and expand it to see permissions
    const adminRoleDetails = page.locator('summary:has-text("Admin")');
    await expect(adminRoleDetails).toBeVisible();
    await adminRoleDetails.click();
    
    // Verify permissions are shown when expanded
    const permissionCount = await page.locator('details li').count();
    expect(permissionCount).toBeGreaterThan(0);
    
    // Check for some expected Admin permissions
    const expectedAdminPermissions = [
      'ADMIN_ACCESS',
      'MANAGE_ROLES',
      'INVITE_USERS'
    ];
    
    for (const permission of expectedAdminPermissions) {
      await expect(page.locator(`details li:has-text("${permission}")`)).toBeVisible();
    }
    
    // Collapse the Admin role
    await adminRoleDetails.click();
    
    // Find and expand the Viewer role
    const viewerRoleDetails = page.locator('summary:has-text("Viewer")');
    await expect(viewerRoleDetails).toBeVisible();
    await viewerRoleDetails.click();
    
    // Verify Viewer permissions (which should be more limited)
    const visiblePermissions = await page.locator('details[open] li').allTextContents();
    
    // Viewer should have VIEW permissions but not MANAGE permissions
    const hasViewPermission = visiblePermissions.some(p => p.includes('VIEW'));
    const hasNoManagePermission = !visiblePermissions.some(p => p.includes('MANAGE'));
    
    expect(hasViewPermission).toBeTruthy();
    expect(hasNoManagePermission).toBeTruthy();
  });

  test('Panel shows loading, error, and empty states', async ({ page }) => {
    // Test loading state by intercepting API requests
    await page.route('/api/admin/users', async (route) => {
      // Delay the response to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Navigate to roles page
    await page.goto('/admin/roles');
    
    // Verify loading skeleton is shown
    await expect(page.locator('.skeleton, .h-10.w-full')).toBeVisible();
    
    // Wait for content to load
    await page.waitForSelector('.skeleton', { state: 'detached' });
    
    // Now test error state by mocking an error response
    await page.route('/api/roles', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Refresh the page to trigger the error
    await page.reload();
    
    // Verify error alert is shown
    await expect(page.locator('text=Failed to fetch roles')).toBeVisible();
    
    // Now test empty state by mocking empty responses
    await page.route('/api/admin/users', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ users: [] })
      });
    });
    
    // Refresh page
    await page.reload();
    
    // Verify empty state message
    await expect(page.locator('text=No users found')).toBeVisible();
  });

  test('Panel is responsive and accessible', async ({ page }) => {
    // Navigate to roles page
    await page.goto('/admin/roles');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Test responsive layout at different viewport sizes
    
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow time for responsive layout to adjust
    
    // Verify table is still accessible on mobile
    await expect(page.locator('h2:has-text("User Role Management")')).toBeVisible();
    
    // Tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    
    // Check for basic accessibility features
    
    // Role dropdowns should have accessible labels
    const roleDropdown = page.locator('select[aria-label*="Assign role"]').first();
    const ariaLabel = await roleDropdown.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    // Buttons should have accessible labels
    const removeButton = page.locator('button[aria-label*="Remove role"]').first();
    if (await removeButton.count() > 0) {
      const buttonAriaLabel = await removeButton.getAttribute('aria-label');
      expect(buttonAriaLabel).toBeTruthy();
    }
    
    // Summary elements for role permissions should be accessible
    const summaryCount = await page.locator('summary').count();
    expect(summaryCount).toBeGreaterThan(0);
  });
}); 