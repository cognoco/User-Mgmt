import { test, expect, Page } from '@playwright/test';

test.describe('Domain Verification Flow', () => {
  let page: Page;
  const testDomain = 'example.com';

  test.beforeEach(async ({ page: p }) => {
    page = p;
    
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin'
      }));
    });
    
    // Mock DNS verification requests for the entire test suite
    await page.route('**/api/company/domains/*/verify-initiate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verificationToken: 'verification-token-123',
          domain: testDomain,
          message: 'Verification initiated successfully'
        })
      });
    });
    
    // Navigate to the company profile page
    await page.goto('/company/settings');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Company Settings")');
  });

  test('complete domain verification flow - add domain, verify, set as primary', async () => {
    // Step 1: Add a new domain
    await test.step('Add a new domain', async () => {
      // Click on the "Add Domain" button
      await page.click('button:has-text("Add Domain")');
      
      // Wait for modal to appear
      await page.waitForSelector('div[role="dialog"]');
      
      // Fill in the domain
      await page.fill('input[name="domain"]', testDomain);
      
      // Submit the form
      await page.click('button:has-text("Add")');
      
      // Wait for success message
      await page.waitForSelector('div[role="status"]:has-text("Domain added")');
      
      // Domain should appear in the list
      expect(await page.textContent(`text=${testDomain}`)).toBeTruthy();
    });
    
    // Step 2: Initiate verification
    await test.step('Initiate domain verification', async () => {
      // Find the domain in the list and click "Initiate Verification" button
      await page.click(`tr:has-text("${testDomain}") button:has-text("Initiate Verification")`);
      
      // Wait for success message
      await page.waitForSelector('div:has-text("Verification initiated")');
      
      // The TXT record instructions should be visible
      expect(await page.isVisible('text=TXT record')).toBeTruthy();
      
      // Verification token should be visible
      const tokenElement = await page.locator('code');
      expect(await tokenElement.isVisible()).toBeTruthy();
      
      // The token should be non-empty
      const token = await tokenElement.textContent();
      expect(token?.length).toBeGreaterThan(10);
    });
    
    // Step 3: Check verification
    await test.step('Check verification status', async () => {
      // Mock DNS to return the verification token
      // This would be done differently in a real E2E environment
      // Here we're just mocking the API response
      await page.route('**/api/company/domains/*/verify-check', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            verified: true,
            message: 'Domain successfully verified.'
          })
        });
      });
      
      // Click "Check Verification" button
      await page.click('button:has-text("Check Verification")');
      
      // Wait for success message
      await page.waitForSelector('div:has-text("Domain successfully verified")');
      
      // The domain should show as verified
      expect(await page.isVisible('text=is verified')).toBeTruthy();
    });
    
    // Step 4: Set as primary domain
    await test.step('Set domain as primary', async () => {
      // Click on the domain options menu
      await page.click(`tr:has-text("${testDomain}") button[aria-label="Domain options"]`);
      
      // Click "Set as Primary" option
      await page.click('text=Set as Primary');
      
      // Wait for confirmation
      await page.waitForSelector('div[role="status"]:has-text("Primary domain updated")');
      
      // The domain should show as primary
      expect(await page.isVisible(`tr:has-text("${testDomain}") text=Primary`)).toBeTruthy();
    });
  });
  
  test('handles verification failure when TXT record is not found', async () => {
    // First add a domain and initiate verification
    // Click on the "Add Domain" button
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    await page.waitForSelector(`text=${testDomain}`);
    
    // Initiate verification
    await page.click(`tr:has-text("${testDomain}") button:has-text("Initiate Verification")`);
    await page.waitForSelector('text=TXT record');
    
    // Mock verification check failure
    await page.route('**/api/company/domains/*/verify-check', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: false,
          message: 'Verification failed. TXT record not found.'
        })
      });
    });
    
    // Click "Check Verification" button
    await page.click('button:has-text("Check Verification")');
    
    // Should show error message
    await page.waitForSelector('div[role="alert"]:has-text("Verification failed")');
    
    // Should still be in unverified state
    expect(await page.isVisible('text=TXT record')).toBeTruthy();
    expect(await page.isVisible('button:has-text("Check Verification")')).toBeTruthy();
  });
  
  test('handles DNS propagation delay scenario', async () => {
    // Add domain and initiate verification first
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    await page.waitForSelector(`text=${testDomain}`);
    
    await page.click(`tr:has-text("${testDomain}") button:has-text("Initiate Verification")`);
    await page.waitForSelector('text=TXT record');
    
    // Mock first check failing with ENOTFOUND (DNS propagation delay)
    await page.route('**/api/company/domains/*/verify-check', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: false,
          message: 'No TXT records found for the domain. Please ensure the record was added correctly and allow time for DNS propagation (up to 48 hours).'
        })
      });
    });
    
    // First check - should show propagation delay message
    await page.click('button:has-text("Check Verification")');
    await page.waitForSelector('div[role="alert"]:has-text("DNS propagation")');
    
    // Now mock success for second attempt (simulating DNS propagation completing)
    await page.unroute('**/api/company/domains/*/verify-check');
    await page.route('**/api/company/domains/*/verify-check', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verified: true,
          message: 'Domain successfully verified.'
        })
      });
    });
    
    // Try verification again
    await page.click('button:has-text("Check Verification")');
    
    // Should now show success
    await page.waitForSelector('div:has-text("Domain successfully verified")');
    expect(await page.isVisible('text=is verified')).toBeTruthy();
  });
  
  test('allows removing domains', async () => {
    // First add a domain
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    await page.waitForSelector(`text=${testDomain}`);
    
    // Now remove it
    await page.click(`tr:has-text("${testDomain}") button[aria-label="Domain options"]`);
    await page.click('text=Remove Domain');
    
    // Confirm removal in dialog
    await page.waitForSelector('div[role="dialog"]:has-text("Remove Domain")');
    await page.click('button:has-text("Remove")');
    
    // Wait for success message
    await page.waitForSelector('div[role="status"]:has-text("Domain removed")');
    
    // Domain should no longer appear in the list
    expect(await page.isVisible(`text=${testDomain}`)).toBeFalsy();
  });
  
  test('validates domain format when adding new domain', async () => {
    // Click on the "Add Domain" button
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    
    // Try to add an invalid domain
    await page.fill('input[name="domain"]', 'invalid-domain');
    await page.click('button:has-text("Add")');
    
    // Should show validation error
    await page.waitForSelector('div[role="alert"]:has-text("Invalid domain format")');
    
    // Dialog should still be open
    expect(await page.isVisible('div[role="dialog"]')).toBeTruthy();
    
    // Try with valid domain
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    
    // Should close dialog and add domain
    await page.waitForSelector('div[role="status"]:has-text("Domain added")');
    expect(await page.isVisible(`text=${testDomain}`)).toBeTruthy();
  });
  
  test('prevents adding duplicate domains', async () => {
    // Add a domain first
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    await page.waitForSelector(`text=${testDomain}`);
    
    // Try to add the same domain again
    await page.click('button:has-text("Add Domain")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="domain"]', testDomain);
    await page.click('button:has-text("Add")');
    
    // Should show duplicate error
    await page.waitForSelector('div[role="alert"]:has-text("already exists")');
    
    // Dialog should still be open
    expect(await page.isVisible('div[role="dialog"]')).toBeTruthy();
  });
}); 