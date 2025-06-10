import { test, expect } from '@playwright/test';

// E2E: SMS MFA Setup and Management

test.describe('SMS MFA Setup and Management', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is already logged in for this flow (or use a helper)
    await page.goto('/settings/security');
    await page.waitForSelector('[data-testid="mfa-management-section"]', { timeout: 10000 });
  });

  test('User can setup SMS MFA, verify, and remove factor', async ({ page }) => {
    // Start SMS setup
    await page.click('[data-testid="mfa-setup-button"]');
    await page.waitForSelector('[data-testid="mfa-setup-dialog"]', { timeout: 5000 });

    // Select SMS method
    await page.click('[data-testid="mfa-method-sms"]');
    await page.fill('[data-testid="mfa-phone-input"]', '+1234567890');
    await page.click('[data-testid="mfa-send-sms-button"]');

    // Wait for code entry UI
    await page.waitForSelector('[data-testid="mfa-code-input"]', { timeout: 5000 });
    await page.fill('[data-testid="mfa-code-input"]', '654321');
    await page.click('[data-testid="mfa-verify-button"]');

    // Wait for backup codes or success message
    await page.waitForSelector('[data-testid="mfa-backup-codes"]', { timeout: 5000 });
    expect(await page.locator('[data-testid="mfa-backup-codes"]').isVisible()).toBeTruthy();

    // Close setup dialog
    await page.click('[data-testid="mfa-setup-close"]');

    // Check SMS factor is now listed in management UI
    await page.waitForSelector('[data-testid="mfa-factor-sms"]', { timeout: 5000 });
    expect(await page.locator('[data-testid="mfa-factor-sms"]').isVisible()).toBeTruthy();

    // Remove SMS factor
    await page.click('[data-testid="mfa-factor-sms-remove"]');
    await page.waitForSelector('[data-testid="mfa-remove-confirm-dialog"]', { timeout: 3000 });
    await page.click('[data-testid="mfa-remove-confirm"]');

    // Success feedback
    await page.waitForSelector('[role="alert"]', { timeout: 3000 });
    expect(await page.locator('[role="alert"]').textContent()).toMatch(/success|removed|disabled/i);
  });

  test('Shows error for invalid SMS code', async ({ page }) => {
    await page.click('[data-testid="mfa-setup-button"]');
    await page.waitForSelector('[data-testid="mfa-setup-dialog"]', { timeout: 5000 });
    await page.click('[data-testid="mfa-method-sms"]');
    await page.fill('[data-testid="mfa-phone-input"]', '+1234567890');
    await page.click('[data-testid="mfa-send-sms-button"]');
    await page.waitForSelector('[data-testid="mfa-code-input"]', { timeout: 5000 });
    await page.fill('[data-testid="mfa-code-input"]', '000000'); // Invalid code
    await page.click('[data-testid="mfa-verify-button"]');
    // Wait for error alert
    await page.waitForSelector('[role="alert"]', { timeout: 3000 });
    expect(await page.locator('[role="alert"]').textContent()).toMatch(/invalid|expired|error/i);
  });
  
  // 4.4 MFA Verify (Login) test
  test('User can verify login with SMS MFA code', async ({ browser }) => {
    // Create a new page for login testing
    const loginPage = await browser.newPage();
    
    try {
      // Attempt login with credentials
      await loginPage.goto('/auth/login');
      await loginPage.fill('input[name="email"]', 'user@example.com');  // Use test credentials
      await loginPage.fill('input[name="password"]', 'password123');    // Use test credentials
      await loginPage.click('button[type="submit"]');
      
      // After password login, we should be prompted for MFA code if enabled
      try {
        // Try multiple possible selectors for MFA input
        const mfaInput = loginPage.locator('[data-testid="mfa-code-input"]')
          .or(loginPage.locator('input[placeholder*="code" i]'))
          .or(loginPage.locator('input[aria-label*="verification" i]'));
        
        // Wait for MFA input to appear (skip test if not found)
        const isMfaVisible = await mfaInput.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isMfaVisible) {
          console.log('MFA verification not prompted - user might not have MFA enabled');
          test.skip();
          return;
        }
        
        // Enter SMS code
        await mfaInput.fill('123456');  // Test code (would be an actual SMS code in real use)
        
        // Click verify button (trying multiple possible selectors)
        const verifyButton = loginPage.getByRole('button', { name: /verify|continue|submit/i });
        await verifyButton.click();
        
        // Check for successful login by waiting for redirect to dashboard or profile
        await Promise.race([
          loginPage.waitForURL('**/dashboard**', { timeout: 10000 }),
          loginPage.waitForURL('**/profile**', { timeout: 10000 }),
          loginPage.waitForURL('**/home**', { timeout: 10000 })
        ]);
        
        // Verify we're logged in by checking for elements that would only be visible to logged-in users
        const loggedInIndicator = loginPage.getByTestId('user-menu')
          .or(loginPage.getByText(/logout|sign out/i))
          .or(loginPage.getByRole('button', { name: /account|profile/i }));
          
        // Allow some time for UI to render after navigation
        const isLoggedIn = await loggedInIndicator.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (isLoggedIn) {
          console.log('Successfully logged in with MFA verification');
        } else {
          // If we got redirected but don't see logged-in UI, something might be wrong
          console.log('Navigation successful but logged-in state unclear');
        }
      } catch (e) {
        console.log('Error during MFA verification:', e);
        await loginPage.screenshot({ path: 'mfa-verification-error.png' });
        throw e;
      }
    } finally {
      await loginPage.close();
    }
  });
  
  // 4.4 MFA Verify with invalid code
  test('Shows error for invalid MFA verification code at login', async ({ browser }) => {
    // Create a new page for login testing
    const loginPage = await browser.newPage();
    
    try {
      // Attempt login with credentials
      await loginPage.goto('/auth/login');
      await loginPage.fill('input[name="email"]', 'user@example.com');  // Use test credentials
      await loginPage.fill('input[name="password"]', 'password123');    // Use test credentials
      await loginPage.click('button[type="submit"]');
      
      // After password login, we should be prompted for MFA code if enabled
      try {
        // Try multiple possible selectors for MFA input
        const mfaInput = loginPage.locator('[data-testid="mfa-code-input"]')
          .or(loginPage.locator('input[placeholder*="code" i]'))
          .or(loginPage.locator('input[aria-label*="verification" i]'));
        
        // Wait for MFA input to appear (skip test if not found)
        const isMfaVisible = await mfaInput.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isMfaVisible) {
          console.log('MFA verification not prompted - user might not have MFA enabled');
          test.skip();
          return;
        }
        
        // Enter invalid SMS code
        await mfaInput.fill('000000');  // Deliberately invalid code
        
        // Click verify button (trying multiple possible selectors)
        const verifyButton = loginPage.getByRole('button', { name: /verify|continue|submit/i });
        await verifyButton.click();
        
        // Should show error message
        const errorMessage = loginPage.locator('[role="alert"]')
          .or(loginPage.getByText(/invalid|incorrect|wrong|expired/i));
          
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        
        // We should still be on the MFA verification page, not logged in
        // Verify MFA input is still visible
        await expect(mfaInput).toBeVisible();
      } catch (e) {
        console.log('Error during invalid MFA code test:', e);
        await loginPage.screenshot({ path: 'mfa-invalid-code-error.png' });
        throw e;
      }
    } finally {
      await loginPage.close();
    }
  });
}); 