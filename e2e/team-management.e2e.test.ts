import { test, expect } from '@playwright/test';

// Test users for each role
const users = {
  admin: { email: 'admin@example.com', password: 'adminpassword' },
  member: { email: 'member@example.com', password: 'memberpassword' },
  viewer: { email: 'viewer@example.com', password: 'viewerpassword' },
  superadmin: { email: 'superadmin@example.com', password: 'superadminpassword' },
};

test.describe('Team Management E2E', () => {
  test('Admin can view, invite, update seats, and remove members', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', users.admin.email);
    await page.fill('input[name="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    await page.goto('/team');
    await expect(page.getByText('Team Management')).toBeVisible();
    await expect(page.getByText('Admin User')).toBeVisible();
    await expect(page.getByText('Member User')).toBeVisible();
    await expect(page.getByText('Viewer User')).toBeVisible();
    // Update seats
    await page.click('text=Update Seats');
    await page.fill('input[type="number"]', '6');
    await page.click('button:has-text("Update Seats")');
    await expect(page.getByText('Seats Used: 3 of 6')).toBeVisible();
    // Remove member
    const removeButtons = await page.locator('button:has-text("Remove")').all();
    await removeButtons[1].click();
    await expect(page.getByText('Successfully removed team member')).toBeVisible();
    // Invite member
    await page.click('button:has-text("Invite")');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.selectOption('select[name="role"]', 'member');
    await page.click('button:has-text("Send Invite")');
    await expect(page.getByText('Invite sent successfully')).toBeVisible();
  });

  test('Member cannot update seats or remove/invite members', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', users.member.email);
    await page.fill('input[name="password"]', users.member.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    await page.goto('/team');
    await expect(page.getByText('Team Management')).toBeVisible();
    // Should not see Update Seats or Invite buttons
    await expect(page.getByText('Update Seats')).not.toBeVisible();
    await expect(page.getByText('Invite')).not.toBeVisible();
    // Should not see Remove buttons
    await expect(page.getByText('Remove')).not.toBeVisible();
  });

  test('Viewer can only view team info', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', users.viewer.email);
    await page.fill('input[name="password"]', users.viewer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    await page.goto('/team');
    await expect(page.getByText('Team Management')).toBeVisible();
    await expect(page.getByText('Update Seats')).not.toBeVisible();
    await expect(page.getByText('Invite')).not.toBeVisible();
    await expect(page.getByText('Remove')).not.toBeVisible();
  });

  test('Superadmin can manage any team', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', users.superadmin.email);
    await page.fill('input[name="password"]', users.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
    await page.goto('/team');
    await expect(page.getByText('Team Management')).toBeVisible();
    await expect(page.getByText('Update Seats')).toBeVisible();
    await expect(page.getByText('Invite')).toBeVisible();
    await expect(page.getByText('Remove')).toBeVisible();
  });
});
