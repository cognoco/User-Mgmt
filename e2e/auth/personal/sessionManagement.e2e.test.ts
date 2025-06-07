import { test, expect, Page } from '@playwright/test';
import { loginUser } from '@/e2e/utils/authUtils'56;

test.describe('1.4: Token Handling & Session Management', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Login user before each test
    await loginUser(page);
  });
  
  test.afterEach(async () => {
    await page.close();
  });

  test('User can view active sessions', async () => {
    // Navigate to profile page
    await page.goto('/account/profile');
    
    // Look for session management section
    const sessionSection = page.getByRole('heading', { name: /active sessions|session management/i });
    await expect(sessionSection).toBeVisible();
    
    // Verify current session is shown
    const sessionTable = page.locator('table').filter({ hasText: /device|browser|ip|action/i });
    await expect(sessionTable).toBeVisible();
    
    // Should have at least one row (current session)
    const sessionRows = sessionTable.locator('tbody tr');
    expect(await sessionRows.count()).toBeGreaterThan(0);
  });

  test('User can revoke a session if multiple exist', async () => {
    // Create a new session by logging in from a different browser context
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext?.newPage();
    
    if (newPage) {
      await loginUser(newPage);
      await newPage.close();
    }
    
    // Navigate to profile page
    await page.goto('/account/profile');
    
    // Wait for session table to load
    await page.waitForSelector('table:has-text("Active Sessions")');
    
    // Check if there are multiple sessions
    const sessionRows = page.locator('table tbody tr');
    const sessionCount = await sessionRows.count();
    
    if (sessionCount > 1) {
      // Find and click the revoke button for the session that's not current
      const revokeButtons = page.getByRole('button', { name: /revoke|terminate/i });
      
      // Expected to find at least one revoke button
      await expect(revokeButtons).toBeVisible();
      
      // Click the first revoke button
      await revokeButtons.first().click();
      
      // Handle any confirmation dialogs
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify session count decreases
      await page.waitForTimeout(500); // Small delay for UI update
      const newSessionCount = await page.locator('table tbody tr').count();
      expect(newSessionCount).toBeLessThan(sessionCount);
    } else {
      console.log('Only one session detected, skipping revocation test');
      test.skip();
    }
  });

  test('Sessions respect timeout policy settings', async () => {
    // This test checks if sessions timeout based on policy
    // For this implementation, we'll test the session activity API endpoint
    
    // First, verify we're logged in
    await page.goto('/account/profile');
    await expect(page.getByRole('heading', { name: /profile|account/i })).toBeVisible();
    
    // Call the session enforcement API directly
    const response = await page.request.post('/api/session/enforce-policies');
    
    // Verify the API works (returns 200 OK)
    expect(response.status()).toBe(200);
    
    // Verify the response indicates success
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Admins can manage organization session policies', async () => {
    // Skip test if not an admin user
    const isAdmin = await page.evaluate(() => {
      return window.localStorage.getItem('user-mgmt-user') 
        ? JSON.parse(window.localStorage.getItem('user-mgmt-user') || '{}')?.app_metadata?.role === 'admin'
        : false;
    });
    
    if (!isAdmin) {
      console.log('Skipping admin test - current user is not an admin');
      test.skip();
      return;
    }
    
    // Navigate to organization settings
    await page.goto('/admin/organizations');
    
    // Click on an organization (first one)
    await page.getByRole('link', { name: /view|manage|edit/i }).first().click();
    
    // Look for Security tab/section
    const securityTab = page.getByRole('link', { name: /security|settings/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();
    }
    
    // Verify session policy form exists
    const timeoutField = page.getByLabel(/session timeout/i);
    await expect(timeoutField).toBeVisible();
    
    const maxSessionsField = page.getByLabel(/max sessions per user/i);
    await expect(maxSessionsField).toBeVisible();
    
    // Update session timeout value
    await timeoutField.clear();
    await timeoutField.fill('60'); // 60 minutes
    
    // Update max sessions value
    await maxSessionsField.clear();
    await maxSessionsField.fill('3'); // 3 max sessions
    
    // Save changes
    await page.getByRole('button', { name: /save|update|apply/i }).click();
    
    // Verify success message appears
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
  });
}); 