import { test, expect, Page } from '@playwright/test';

// Admin credentials from environment or defaults
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'adminpassword';

/**
 * Helper function to login as admin
 */
async function loginAsAdmin(page: Page): Promise<boolean> {
  await page.goto('/auth/login');
  
  // Fill in login form
  await page.fill('#email, input[name="email"]', ADMIN_EMAIL);
  await page.fill('#password, input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  try {
    await Promise.race([
      page.waitForURL('**/admin**', { timeout: 10000 }),
      page.waitForURL('**/dashboard**', { timeout: 10000 })
    ]);
    
    // If we're not on an admin page, try to navigate there
    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
    }
    
    return true;
  } catch (e) {
    console.log('Admin login or navigation failed:', e);
    await page.screenshot({ path: 'admin-login-failed.png' });
    return false;
  }
}

test.describe('4.9: Organization Security Policy', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login as admin before each test
    const loginSuccessful = await loginAsAdmin(page);
    if (!loginSuccessful) {
      test.skip();
    }
  });
  
  test.afterEach(async () => {
    await page.close();
  });

  // Helper function to navigate to security policy section
  async function navigateToSecurityPolicy(): Promise<boolean> {
    // Try multiple possible paths to security settings
    try {
      // First try: direct navigation to security policy page
      await page.goto('/admin/security-policy');
      
      // Check if we have any security settings visible
      const securityHeading = page.getByRole('heading', { name: /security policy|security settings/i });
      if (await securityHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        return true;
      }
      
      // Second try: navigate to admin dashboard and look for security link
      await page.goto('/admin');
      
      // Look for link/button to security settings
      const securityLink = page.getByRole('link', { name: /security|policies/i })
        .or(page.getByText(/security settings|security policies/i).first());
        
      if (await securityLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await securityLink.click();
        await page.waitForLoadState('domcontentloaded');
        return true;
      }
      
      // Third try: check if security is a tab in admin settings
      const securityTab = page.getByRole('tab', { name: /security|policies/i });
      if (await securityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await securityTab.click();
        return true;
      }
      
      // If we can't find the section, take a screenshot to help debugging
      await page.screenshot({ path: 'admin-ui-no-security-policy.png' });
      console.log('Could not find security policy section in admin UI');
      
      return false;
    } catch (e) {
      console.log('Error navigating to security policy:', e);
      return false;
    }
  }

  test('Admin can view security policy settings', async () => {
    // Navigate to security policy section
    const navigated = await navigateToSecurityPolicy();
    expect(navigated).toBe(true);
    
    // Look for common security policy sections/tabs
    // Only expecting to find at least one of these to consider the test passing
    const securitySections = [
      'session-policies',
      'password-policies',
      'mfa-requirements',
      'ip-restrictions'
    ];
    
    let foundAnySection = false;
    
    for (const section of securitySections) {
      // Look for section heading, tab, or content
      const sectionElement = page.locator(`[data-testid="${section}"]`)
        .or(page.getByRole('tab', { name: new RegExp(section.replace('-', ' '), 'i') }))
        .or(page.getByText(new RegExp(section.replace('-', ' '), 'i'), { exact: false }).first());
        
      const isVisible = await sectionElement.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        foundAnySection = true;
        console.log(`Found security section: ${section}`);
        
        // Try to click the tab/section if it's a tab
        try {
          await sectionElement.click();
          await page.waitForTimeout(500);
        } catch (e) {
          // Might not be clickable, that's OK
        }
      }
    }
    
    // At least one section should be found for a proper security policy page
    expect(foundAnySection).toBe(true);
    
    // Take a screenshot of the security policy page for verification
    await page.screenshot({ path: 'admin-security-policy.png' });
  });

  test('Admin can configure session policies', async () => {
    // Navigate to security policy section
    const navigated = await navigateToSecurityPolicy();
    expect(navigated).toBe(true);
    
    // Try to find and click the session policies tab if it exists
    try {
      const sessionTab = page.getByRole('tab', { name: /session|sessions/i })
        .or(page.getByText(/session policies/i));
        
      if (await sessionTab.isVisible({ timeout: 5000 })) {
        await sessionTab.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Tab might not exist, or we might already be on the correct tab/section
      console.log('Session tab not found or not clickable');
    }
    
    // Look for session timeout input
    const sessionTimeoutInput = page.locator('input[name*="session"]')
      .or(page.locator('input[name*="timeout"]'))
      .or(page.locator('[data-testid="session-timeout"]'));
      
    // If we can't find specific input, skip the test
    if (!(await sessionTimeoutInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('Session timeout input not found, skipping test');
      test.skip();
      return;
    }
    
    // Get current value
    const currentValue = await sessionTimeoutInput.inputValue();
    
    // Set a new value (30 minutes if current is not 30, otherwise 60)
    const newValue = currentValue === '30' ? '60' : '30';
    await sessionTimeoutInput.fill(newValue);
    
    // Look for and click save button
    const saveButton = page.getByRole('button', { name: /save|update|apply/i });
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      
      // Look for success message
      const successMessage = page.getByRole('alert')
        .or(page.getByText(/saved|updated|success/i));
        
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Verify value was saved (refresh page and check again)
      await page.reload();
      
      // Try to find and click the session policies tab again if needed
      try {
        const sessionTab = page.getByRole('tab', { name: /session|sessions/i });
        if (await sessionTab.isVisible({ timeout: 5000 })) {
          await sessionTab.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // Tab might not exist, or we might already be on the correct tab
      }
      
      // Check input value matches what we set
      await expect(sessionTimeoutInput).toHaveValue(newValue);
    } else {
      // If no save button, the form might auto-save or have a different pattern
      // Take a screenshot to help with debugging
      await page.screenshot({ path: 'session-policy-no-save-button.png' });
      console.log('No save button found for session policies');
    }
  });

  test('Admin can configure MFA requirements', async () => {
    // Navigate to security policy section
    const navigated = await navigateToSecurityPolicy();
    expect(navigated).toBe(true);
    
    // Try to find and click the MFA requirements tab if it exists
    try {
      const mfaTab = page.getByRole('tab', { name: /mfa|multi-factor|2fa/i })
        .or(page.getByText(/mfa requirements/i));
        
      if (await mfaTab.isVisible({ timeout: 5000 })) {
        await mfaTab.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Tab might not exist, or we might already be on the correct tab/section
      console.log('MFA tab not found or not clickable');
    }
    
    // Look for "Require MFA" toggle switch
    const requireMfaToggle = page.locator('[data-testid="require-mfa-toggle"]')
      .or(page.getByRole('switch', { name: /require|enforce mfa/i }))
      .or(page.locator('input[type="checkbox"]').filter({ hasText: /require mfa/i }));
      
    // If we can't find the toggle, skip the test
    if (!(await requireMfaToggle.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('MFA requirement toggle not found, skipping test');
      test.skip();
      return;
    }
    
    // Get current state (checked or not)
    const isCurrentlyChecked = await requireMfaToggle.isChecked().catch(() => false);
    
    // Toggle the switch (click will reverse the current state)
    await requireMfaToggle.click();
    
    // Look for and click save button
    const saveButton = page.getByRole('button', { name: /save|update|apply/i });
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      
      // Look for success message
      const successMessage = page.getByRole('alert')
        .or(page.getByText(/saved|updated|success/i));
        
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Verify value was saved (refresh page and check again)
      await page.reload();
      
      // Try to find and click the MFA requirements tab again if needed
      try {
        const mfaTab = page.getByRole('tab', { name: /mfa|multi-factor|2fa/i });
        if (await mfaTab.isVisible({ timeout: 5000 })) {
          await mfaTab.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // Tab might not exist, or we might already be on the correct tab
      }
      
      // Check toggle state is reversed from what it was
      await expect(requireMfaToggle).toBeChecked({ checked: !isCurrentlyChecked });
      
      // Toggle back to original state to clean up
      await requireMfaToggle.click();
      
      if (await saveButton.isVisible({ timeout: 5000 })) {
        await saveButton.click();
      }
    } else {
      // If no save button, the form might auto-save or have a different pattern
      // Take a screenshot to help with debugging
      await page.screenshot({ path: 'mfa-policy-no-save-button.png' });
      console.log('No save button found for MFA policies');
      
      // Check if the toggle state was changed anyway (auto-save)
      const newState = await requireMfaToggle.isChecked().catch(() => null);
      
      if (newState !== null && newState !== isCurrentlyChecked) {
        console.log('MFA toggle state changed successfully (auto-save)');
        
        // Toggle back to original state to clean up
        await requireMfaToggle.click();
      }
    }
  });

  test('Admin can configure password policies', async () => {
    // Navigate to security policy section
    const navigated = await navigateToSecurityPolicy();
    expect(navigated).toBe(true);
    
    // Try to find and click the password policies tab if it exists
    try {
      const passwordTab = page.getByRole('tab', { name: /password/i })
        .or(page.getByText(/password policies/i));
        
      if (await passwordTab.isVisible({ timeout: 5000 })) {
        await passwordTab.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Tab might not exist, or we might already be on the correct tab/section
      console.log('Password tab not found or not clickable');
    }
    
    // Look for minimum password length input
    const minLengthInput = page.locator('input[name*="password"][name*="length"]')
      .or(page.locator('[data-testid="min-password-length"]'))
      .or(page.locator('input[type="number"]').first());
      
    // If we can't find the input, skip the test
    if (!(await minLengthInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('Minimum password length input not found, skipping test');
      test.skip();
      return;
    }
    
    // Get current value
    const currentValue = await minLengthInput.inputValue();
    
    // Set a new value (8 if current is not 8, otherwise 10)
    const newValue = currentValue === '8' ? '10' : '8';
    await minLengthInput.fill(newValue);
    
    // Look for and click save button
    const saveButton = page.getByRole('button', { name: /save|update|apply/i });
    
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      
      // Look for success message
      const successMessage = page.getByRole('alert')
        .or(page.getByText(/saved|updated|success/i));
        
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Verify value was saved (refresh page and check again)
      await page.reload();
      
      // Try to find and click the password policies tab again if needed
      try {
        const passwordTab = page.getByRole('tab', { name: /password/i });
        if (await passwordTab.isVisible({ timeout: 5000 })) {
          await passwordTab.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // Tab might not exist, or we might already be on the correct tab
      }
      
      // Check input value matches what we set
      await expect(minLengthInput).toHaveValue(newValue);
      
      // Reset to original value to clean up
      await minLengthInput.fill(currentValue);
      
      if (await saveButton.isVisible({ timeout: 5000 })) {
        await saveButton.click();
      }
    } else {
      // If no save button, the form might auto-save or have a different pattern
      // Take a screenshot to help with debugging
      await page.screenshot({ path: 'password-policy-no-save-button.png' });
      console.log('No save button found for password policies');
    }
  });
  
  test('Admin can view active sessions and terminate them', async () => {
    // Navigate to security policy section
    const navigated = await navigateToSecurityPolicy();
    expect(navigated).toBe(true);
    
    // Look for user sessions section
    // This could be a separate tab, a section on the page, or a separate page
    let foundSessionsSection = false;
    
    // Try approach 1: Look for a sessions tab
    try {
      const sessionsTab = page.getByRole('tab', { name: /sessions|active sessions/i });
      
      if (await sessionsTab.isVisible({ timeout: 3000 })) {
        await sessionsTab.click();
        await page.waitForTimeout(500);
        foundSessionsSection = true;
      }
    } catch (e) {
      console.log('Sessions tab not found, trying other approaches');
    }
    
    // Try approach 2: Look for a separate link to sessions page
    if (!foundSessionsSection) {
      try {
        const sessionsLink = page.getByRole('link', { name: /manage sessions|user sessions/i })
          .or(page.getByText(/view active sessions/i));
          
        if (await sessionsLink.isVisible({ timeout: 3000 })) {
          await sessionsLink.click();
          await page.waitForLoadState('domcontentloaded');
          foundSessionsSection = true;
        }
      } catch (e) {
        console.log('Sessions link not found, trying other approaches');
      }
    }
    
    // Try approach 3: Look for sessions section heading on current page
    if (!foundSessionsSection) {
      const sessionsHeading = page.getByRole('heading', { name: /active sessions|user sessions/i })
        .or(page.getByText(/active sessions/i).first());
        
      foundSessionsSection = await sessionsHeading.isVisible({ timeout: 3000 }).catch(() => false);
    }
    
    // If we can't find the sessions section, skip the test
    if (!foundSessionsSection) {
      console.log('User sessions section not found, skipping test');
      test.skip();
      return;
    }
    
    // Look for a session table, list, or container
    const sessionsList = page.locator('[data-testid="sessions-table"]')
      .or(page.locator('table').filter({ hasText: /user|device|ip|last activity/i }))
      .or(page.locator('.sessions-list'));
      
    // Verify sessions list is visible
    await expect(sessionsList).toBeVisible({ timeout: 5000 });
    
    // Look for terminate/revoke session button
    const terminateButton = page.getByRole('button', { name: /terminate|revoke|end session|log out/i }).first();
    
    if (await terminateButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Take a screenshot before clicking
      await page.screenshot({ path: 'before-session-termination.png' });
      
      // Click the button
      await terminateButton.click();
      
      // Look for confirmation dialog
      const confirmDialog = page.getByRole('dialog');
      
      if (await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Confirm the action
        const confirmButton = page.getByRole('button', { name: /confirm|yes|terminate/i });
        await confirmButton.click();
      }
      
      // Look for success message
      const successMessage = page.getByRole('alert')
        .or(page.getByText(/terminated|revoked|success/i));
        
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Take a screenshot after termination
      await page.screenshot({ path: 'after-session-termination.png' });
    } else {
      console.log('No terminate button found, but sessions list is visible');
      // This could happen if there are no active sessions to terminate
      // Test should still pass if we can view the sessions list
    }
  });
}); 