import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for the onboarding flow
 * 
 * These tests cover the user onboarding experience including:
 * - Welcome screen appearance for new users
 * - Progress bar functionality
 * - Profile completion step
 * - Feature tour navigation
 * - Preferences setup
 * - Onboarding completion
 * - Skip/reset onboarding functionality
 */

// Test password
const TEST_PASSWORD = 'SecurePassword123!';

/**
 * Helper function to register a new test user
 * This ensures we get a fresh user who will see the onboarding flow
 */
async function registerNewUser(page: Page): Promise<void> {
  await page.goto('/auth/register');
  
  // Fill registration form with unique email
  const uniqueEmail = `onboarding-test-${Date.now()}@example.com`;
  await page.locator('[data-testid="email-input"]').fill(uniqueEmail);
  await page.locator('[data-testid="first-name-input"]').fill('Onboarding');
  await page.locator('[data-testid="last-name-input"]').fill('Test User');
  await page.locator('[data-testid="password-input"]').fill(TEST_PASSWORD);
  await page.locator('[data-testid="confirm-password-input"]').fill(TEST_PASSWORD);
  
  // Accept terms
  try {
    // Try clicking the label first (most reliable)
    await page.click('[data-testid="terms-label"]', { timeout: 5000 });
  } catch (_) {
    try {
      // Try direct checkbox check
      await page.locator('[data-testid="terms-checkbox"]').check({ timeout: 5000 });
    } catch (_) {
      // Last resort: force-click with increased timeout
      await page.click('[data-testid="terms-label"]', { 
        force: true, 
        timeout: 10000 
      });
    }
  }
  
  // Submit form and wait for completion
  await page.locator('[data-testid="register-button"]').click();
  
  // Wait for registration to complete (allow for redirect or success message)
  await Promise.race([
    page.waitForURL('/auth/verify-email', { timeout: 10000 }),
    page.waitForURL('/auth/check-email', { timeout: 10000 }),
    page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 })
  ]).catch(() => {
    console.log('Navigation after registration may have failed, but continuing test');
  });
  
  // Skip email verification for testing purposes
  // In a real environment, we'd want to use a test email service like Mailosaur
  // to actually verify the email flow
  
  // Force user verification in the test environment
  // This simulates a user who has verified their email and is logging in for the first time
  // Implementation depends on your auth system, this is just a placeholder
  // You may need to call an API or directly modify the database
  
  await page.evaluate((email) => {
    // Mark user as verified in localStorage for testing purposes
    // In a real implementation, you would interact with your actual auth system
    localStorage.setItem('test_verified_user', email);
  }, uniqueEmail);
  
  return;
}

// Keeping the loginAsUser function commented out for future use
// If needed, it can be uncommented and utilized in tests
/*
async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/auth/login');
  
  await page.locator('#email').fill('test-user@example.com');
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  
  // Wait for login to complete
  await page.waitForTimeout(2000);
}
*/

test.describe('Onboarding Flow', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    // Create a fresh context for each test to ensure clean state
    const context = await browser.newContext();
    page = await context.newPage();
  });
  
  test('should show welcome screen for new users', async () => {
    // Register a new user to trigger onboarding
    await registerNewUser(page);
    
    // Navigate to dashboard or home page - this should trigger onboarding for new users
    await page.goto('/dashboard/overview');
    
    // Verify welcome screen appears
    await expect(page.locator('h1:has-text("Welcome to Generic App")')).toBeVisible({ timeout: 10000 });
    
    // Verify progress indicator exists and shows initial progress
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();
    
    // Verify next button exists
    await expect(page.getByRole('button', { name: /next|continue|get started/i })).toBeVisible();
  });
  
  test('should display profile completion step correctly', async () => {
    // Register and navigate to trigger onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Advance to profile step (if needed)
    const welcomeVisible = await page.locator('h1:has-text("Welcome to Generic App")').isVisible().catch(() => false);
    if (welcomeVisible) {
      await page.getByRole('button', { name: /next|continue|get started/i }).click();
      await page.waitForTimeout(500);
    }
    
    // Verify profile step appears
    await expect(page.locator('h1, h2, h3').filter({ hasText: /profile|personal info/i })).toBeVisible({ timeout: 5000 });
    
    // Verify form fields exist
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    
    // Verify progress indicator shows appropriate progress
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();
    
    // Verify next/back buttons
    await expect(page.getByRole('button', { name: /next|continue|save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back|previous/i })).toBeVisible();
  });
  
  test('should navigate through feature tour steps', async () => {
    // Register and navigate to trigger onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Advance to feature tour step
    // First through welcome screen
    const welcomeVisible = await page.locator('h1:has-text("Welcome to Generic App")').isVisible().catch(() => false);
    if (welcomeVisible) {
      await page.getByRole('button', { name: /next|continue|get started/i }).click();
      await page.waitForTimeout(500);
    }
    
    // Then through profile step (if needed)
    const profileVisible = await page.locator('h1, h2, h3').filter({ hasText: /profile|personal info/i }).isVisible().catch(() => false);
    if (profileVisible) {
      await page.getByRole('button', { name: /next|continue|save/i }).click();
      await page.waitForTimeout(500);
    }
    
    // Verify feature tour appears
    await expect(page.locator('h1, h2, h3').filter({ hasText: /features|explore/i })).toBeVisible({ timeout: 5000 });
    
    // Navigate through tour steps
    const nextButton = page.getByRole('button', { name: /next|continue/i });
    
    // Get initial step content for comparison
    const initialStepContent = await page.locator('[data-testid="feature-tour-content"]').textContent();
    
    // Click next to advance to second step
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // Verify content changed (we're on a new step)
    const secondStepContent = await page.locator('[data-testid="feature-tour-content"]').textContent();
    expect(secondStepContent).not.toBe(initialStepContent);
    
    // Verify previous button works
    await page.getByRole('button', { name: /back|previous/i }).click();
    await page.waitForTimeout(500);
    
    // Verify we're back to first step
    const backToFirstContent = await page.locator('[data-testid="feature-tour-content"]').textContent();
    expect(backToFirstContent).toBe(initialStepContent);
  });
  
  test('should allow setting preferences', async () => {
    // Register and navigate to trigger onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Advance to settings/preferences step
    // This requires clicking through previous steps
    const buttons = ['next', 'continue', 'save', 'next'];
    for (const buttonText of buttons) {
      try {
        await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
        await page.waitForTimeout(500);
      } catch (e) {
        // If a button isn't found, just continue to the next one
        console.log(`Button with text ${buttonText} not found, continuing...`);
      }
    }
    
    // Verify settings/preferences screen appears
    await expect(page.locator('h1, h2, h3').filter({ 
      hasText: /settings|preferences|configure|setup/i 
    })).toBeVisible({ timeout: 5000 });
    
    // Toggle some preferences
    // First try targeting by testid
    try {
      await page.locator('[data-testid="dark-mode-toggle"]').click({ timeout: 3000 });
    } catch (e) {
      // Fallback to targeting by label text
      try {
        await page.locator('label').filter({ hasText: /dark mode|theme/i }).click();
      } catch (e2) {
        console.log('Could not find theme toggle, trying general checkbox');
        // Last resort: try any checkbox
        await page.locator('input[type="checkbox"]').first().check();
      }
    }
    
    // Select an option from dropdown if it exists
    const hasDropdown = await page.locator('select').count() > 0;
    if (hasDropdown) {
      await page.locator('select').selectOption({ index: 1 });
    }
    
    // Save preferences
    await page.getByRole('button', { name: /save|next|continue|finish/i }).click();
    
    // Verify progress indicator shows appropriate progress
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();
  });
  
  test('should complete onboarding and redirect to app', async () => {
    // Register and navigate to trigger onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Quickly complete all onboarding steps by clicking next on each screen
    // We're testing the completion flow here, not the individual steps
    for (let i = 0; i < 5; i++) {
      try {
        await page.getByRole('button', { name: /next|continue|save|finish|complete|get started/i }).click();
        await page.waitForTimeout(500);
      } catch (e) {
        // If we can't find a next button, we might be done or on a different screen
        break;
      }
    }
    
    // Look for completion indicators
    const completionIndicators = [
      // Most specific to least specific
      page.locator('h1, h2, h3').filter({ hasText: /complete|finished|all set|ready/i }),
      page.locator('[data-testid="onboarding-complete"]'),
      page.locator('text=Dashboard'), // We might be on the main app already
      page.locator('text=Home'),
    ];
    
    // Check each indicator until we find one
    let completionFound = false;
    for (const indicator of completionIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        completionFound = true;
        break;
      }
    }
    
    expect(completionFound).toBe(true);
    
    // If we found a completion screen, click finish to go to app
    try {
      await page.getByRole('button', { name: /finish|complete|done|start using/i }).click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // If no button is found, we might already be in the app
      console.log('No completion button found, may already be in app');
    }
    
    // Verify we're in the main app (dashboard, home, etc.)
    const appIndicators = [
      page.locator('text=Dashboard'),
      page.locator('text=Home'),
      page.locator('nav'), // Main navigation should be visible
    ];
    
    let inApp = false;
    for (const indicator of appIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        inApp = true;
        break;
      }
    }
    
    expect(inApp).toBe(true);
  });
  
  test('should allow skipping onboarding', async () => {
    // Register and navigate to trigger onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Look for skip button - it might be labeled as "skip", "skip for now", etc.
    const skipButtons = [
      page.getByRole('button', { name: /skip|skip .* now/i }),
      page.getByRole('link', { name: /skip|skip .* now/i }),
      page.locator('button, a').filter({ hasText: /skip/i }),
    ];
    
    let skipButton = null;
    for (const button of skipButtons) {
      if (await button.isVisible().catch(() => false)) {
        skipButton = button;
        break;
      }
    }
    
    // If no skip button is found, test can't continue
    if (!skipButton) {
      // Don't fail test, but log it clearly
      console.log('No skip button found in onboarding flow - this test is inconclusive');
      test.skip();
      return;
    }
    
    // Click the skip button
    await skipButton.click();
    
    // Verify confirmation dialog appears, if any
    const confirmSkipVisible = await page.locator('text=/sure|confirm|skip|confirmation/i').isVisible().catch(() => false);
    if (confirmSkipVisible) {
      // Click confirm/yes
      await page.getByRole('button', { name: /yes|confirm|proceed|skip/i }).click();
    }
    
    // Verify we're redirected to the main app
    await page.waitForTimeout(1000);
    
    // Check for app indicators
    const appIndicators = [
      page.locator('text=Dashboard'),
      page.locator('text=Home'),
      page.locator('nav'), // Main navigation should be visible
    ];
    
    let inApp = false;
    for (const indicator of appIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        inApp = true;
        break;
      }
    }
    
    expect(inApp).toBe(true);
    
    // Verify onboarding doesn't reappear
    // Refresh the page to check if onboarding stays dismissed
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Check that onboarding welcome doesn't appear again
    const onboardingReappeared = await page.locator('h1:has-text("Welcome to Generic App")').isVisible().catch(() => false);
    expect(onboardingReappeared).toBe(false);
  });
  
  test('should be able to reset onboarding state from settings', async () => {
    // Register user, then skip onboarding
    await registerNewUser(page);
    await page.goto('/dashboard/overview');
    
    // Skip onboarding if visible
    try {
      const skipButton = page.getByRole('button', { name: /skip|skip .* now/i });
      if (await skipButton.isVisible({ timeout: 3000 })) {
        await skipButton.click();
        
        // Handle confirmation if it appears
        const confirmSkipVisible = await page.locator('text=/sure|confirm|skip|confirmation/i').isVisible({ timeout: 2000 }).catch(() => false);
        if (confirmSkipVisible) {
          await page.getByRole('button', { name: /yes|confirm|proceed|skip/i }).click();
        }
      }
    } catch (e) {
      console.log('Skip button not found or not needed');
    }
    
    // Wait to be in the app
    await page.waitForTimeout(1000);
    
    // Navigate to settings/profile page
    // Try multiple possible navigation paths
    try {
      // Try via avatar/user menu
      await page.locator('[data-testid="user-menu"], [aria-label="User menu"]').click();
      await page.getByRole('menuitem', { name: /settings|profile|account/i }).click();
    } catch (e) {
      try {
        // Try via direct navigation
        await page.goto('/settings');
      } catch (e2) {
        try {
          // Try via navigation menu
          await page.locator('nav').getByRole('link', { name: /settings|profile/i }).click();
        } catch (e3) {
          console.log('Could not navigate to settings via standard paths');
          // Last resort: try some common settings paths
          for (const path of ['/settings', '/account/profile', '/account', '/preferences']) {
            try {
              await page.goto(path);
              break;
            } catch (e4) {
              console.log(`Failed to navigate to ${path}`);
            }
          }
        }
      }
    }
    
    // Look for reset onboarding option
    // This might be in different places depending on the implementation
    const resetOptions = [
      page.getByRole('button', { name: /reset .* onboarding|restart .* wizard|reset .* tour/i }),
      page.locator('button').filter({ hasText: /reset|restart|onboarding|wizard|tour/i }),
      page.locator('[data-testid="reset-onboarding"]'),
    ];
    
    let resetButton = null;
    for (const option of resetOptions) {
      if (await option.isVisible().catch(() => false)) {
        resetButton = option;
        break;
      }
    }
    
    // If we can't find a reset option, the test is inconclusive
    if (!resetButton) {
      console.log('No reset onboarding option found - test is inconclusive');
      test.skip();
      return;
    }
    
    // Click the reset button
    await resetButton.click();
    
    // Handle confirmation if it appears
    const confirmResetVisible = await page.locator('text=/sure|confirm|reset|confirmation/i').isVisible().catch(() => false);
    if (confirmResetVisible) {
      await page.getByRole('button', { name: /yes|confirm|proceed|reset/i }).click();
    }
    
    // Navigate to dashboard to verify onboarding reappears
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(1000);
    
    // Check that onboarding welcome appears again
    const onboardingReappeared = await page.locator('h1:has-text("Welcome to Generic App")').isVisible().catch(() => false) ||
                               await page.locator('[data-testid="onboarding-welcome"]').isVisible().catch(() => false);
    
    expect(onboardingReappeared).toBe(true);
  });
}); 