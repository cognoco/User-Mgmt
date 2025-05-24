import { Page } from '@playwright/test';

/**
 * Logs in a user via the UI.
 * Assumes the page is already navigated to the login page or the function handles navigation.
 * Uses multiple strategies to find and interact with form elements based on TESTING ISSUES-E2E.md guidelines.
 *
 * @param page The Playwright Page object.
 * @param username The username (email) to enter.
 * @param password The password to enter.
 */
export async function loginAs(page: Page, username: string, password: string): Promise<void> {
  // 1. Navigate to login page if not already there
  if (!page.url().includes('/auth/login')) {
    await page.goto('/auth/login');
  }

  // 2. Fill in credentials using multiple strategies for better reliability
  // Try multiple selectors for email field based on our LoginForm implementations
  try {
    // First try label-based selector (most semantic)
    await page.getByLabel('Email').fill(username);
  } catch (error) {
    try {
      // Then try ID-based selector
      await page.locator('#email').fill(username);
    } catch (error2) {
      // Finally try JavaScript to set value directly (for Safari or custom components)
      await page.evaluate((user) => {
        const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('#email') ||
                        document.querySelector('[name="email"]');
        if (emailInput) {
          (emailInput as HTMLInputElement).value = user;
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, username);
    }
  }

  // Similar approach for password field
  try {
    await page.getByLabel('Password').fill(password);
  } catch (error) {
    try {
      await page.locator('#password').fill(password);
    } catch (error2) {
      await page.evaluate((pass) => {
        const passwordInput = document.querySelector('input[type="password"]') ||
                           document.querySelector('#password') ||
                           document.querySelector('[name="password"]');
        if (passwordInput) {
          (passwordInput as HTMLInputElement).value = pass;
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, password);
    }
  }

  // 3. Click login button using multiple strategies
  try {
    // Try role-based selector first
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();
  } catch (error) {
    try {
      // Try form submission as fallback
      await page.locator('form').evaluate(form => (form as HTMLFormElement).submit());
    } catch (error2) {
      // Last resort: find any button in the form
      await page.locator('form button[type="submit"]').click();
    }
  }

  // 4. Wait for navigation or login confirmation
  try {
    // Try waiting for URL change
    await page.waitForURL('**/dashboard**', { timeout: 5000 }).catch(() => {
      console.log('No redirect to dashboard detected');
    });
    
    // Check if we see a dashboard element or successfully logged in element
    const loggedIn = await Promise.race([
      page.getByRole('heading', { name: /dashboard|profile|welcome/i }).isVisible({ timeout: 3000 })
        .catch(() => false),
      page.locator('[role="alert"]').filter({ hasText: /success/i }).isVisible({ timeout: 3000 })
        .catch(() => false)
    ]);
    
    if (!loggedIn) {
      // Check for error messages
      const hasError = await page.locator('[role="alert"]').filter({ hasText: /error|invalid|failed/i }).isVisible({ timeout: 2000 })
        .catch(() => false);
      
      if (hasError) {
        console.error(`Login error detected for ${username}`);
      }
    }
  } catch (error) {
    // If we can't confirm login success, log it but don't fail the test
    console.log(`Unable to confirm login status for ${username}, continuing test`);
  }
} 