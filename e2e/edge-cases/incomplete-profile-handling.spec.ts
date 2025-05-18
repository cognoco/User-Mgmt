import { test, expect, Page } from '@playwright/test';

test.describe('Incomplete Profile Handling', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    
    // Mock authentication with a user that has incomplete profile data
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'incomplete@example.com',
        firstName: 'Incomplete',
        lastName: 'User',
        role: 'user',
        accountType: 'business'
      }));
      
      // Mock empty/incomplete company data
      window.localStorage.setItem('company', JSON.stringify({
        id: 'company-123',
        name: 'Incomplete Company',
        // Missing many fields like address, contact info, etc.
      }));
    });
  });

  test('displays appropriate placeholders for missing personal profile data', async () => {
    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForSelector('h1:has-text("Profile")');
    
    // Check that name and email are displayed
    expect(await page.textContent('text=Incomplete User')).toBeTruthy();
    expect(await page.textContent('text=incomplete@example.com')).toBeTruthy();
    
    // Verify placeholders for missing fields
    expect(await page.isVisible('text=Phone number not provided')).toBeTruthy();
    expect(await page.isVisible('text=No profile picture')).toBeTruthy();
    
    // Check for "Complete your profile" prompt
    expect(await page.isVisible('text=Your profile is incomplete')).toBeTruthy();
    expect(await page.isVisible('button:has-text("Complete Profile")')).toBeTruthy();
  });
  
  test('displays appropriate placeholders for missing company data', async () => {
    // Navigate to company settings
    await page.goto('/company/settings');
    await page.waitForSelector('h1:has-text("Company Settings")');
    
    // Check that company name is displayed
    expect(await page.textContent('text=Incomplete Company')).toBeTruthy();
    
    // Verify placeholders for missing company fields
    expect(await page.isVisible('text=No company website provided')).toBeTruthy();
    expect(await page.isVisible('text=No address provided')).toBeTruthy();
    expect(await page.isVisible('text=Contact information missing')).toBeTruthy();
    expect(await page.isVisible('text=No company logo')).toBeTruthy();
    
    // Check for completion prompt
    expect(await page.isVisible('text=Your company profile is incomplete')).toBeTruthy();
  });
  
  test('empty state shows appropriate UI when no domains are added', async () => {
    // Navigate to domain verification page
    await page.goto('/company/domains');
    await page.waitForSelector('h1:has-text("Domain Verification")');
    
    // Check empty state message
    expect(await page.isVisible('text=No domains have been added yet')).toBeTruthy();
    expect(await page.isVisible('text=Add a domain to verify your company')).toBeTruthy();
    
    // Check for add domain button
    expect(await page.isVisible('button:has-text("Add Domain")')).toBeTruthy();
  });
  
  test('handles gracefully when company data fails to load', async () => {
    // Mock API error when trying to load company data
    await page.route('**/api/profile/business', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to fetch company profile'
        })
      });
    });
    
    // Navigate to company settings
    await page.goto('/company/settings');
    
    // Check for error state
    expect(await page.isVisible('text=Could not load company profile')).toBeTruthy();
    expect(await page.isVisible('text=Please try again later')).toBeTruthy();
    
    // Check for retry button
    expect(await page.isVisible('button:has-text("Retry")')).toBeTruthy();
  });
  
  test('shows correct permission errors for non-admin users', async () => {
    // Change user role to non-admin
    await page.addInitScript(() => {
      const user = JSON.parse(window.localStorage.getItem('user') || '{}');
      user.role = 'member';
      window.localStorage.setItem('user', JSON.stringify(user));
    });
    
    // Navigate to company settings
    await page.goto('/company/settings');
    await page.waitForSelector('h1:has-text("Company Settings")');
    
    // Verify read-only view is shown
    expect(await page.isVisible('text=You do not have permission to edit')).toBeTruthy();
    
    // Check that edit buttons are not visible or disabled
    expect(await page.locator('button:has-text("Edit Company Details")').isDisabled()).toBeTruthy();
    expect(await page.locator('button:has-text("Change Logo")').isDisabled()).toBeTruthy();
  });
  
  test('prompts user to complete profile when accessing restricted feature', async () => {
    // Navigate to a feature that requires complete profile
    await page.goto('/company/team-management');
    
    // Check for completion requirement message
    expect(await page.isVisible('text=Complete your company profile')).toBeTruthy();
    expect(await page.isVisible('text=You need to complete your company profile before accessing team management')).toBeTruthy();
    
    // Check for complete profile button
    expect(await page.isVisible('button:has-text("Complete Company Profile")')).toBeTruthy();
    
    // Click the button and verify redirect to company settings
    await page.click('button:has-text("Complete Company Profile")');
    await expect(page).toHaveURL(/.*\/company\/settings/);
  });
  
  test('handles incomplete data during business registration flow', async () => {
    // Clear localStorage to simulate a new user
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    
    // Navigate to registration page
    await page.goto('/register');
    await page.waitForSelector('button:has-text("Business Account")');
    
    // Select business account tab
    await page.click('button:has-text("Business Account")');
    
    // Fill only some fields, leaving others empty
    await page.fill('input[name="firstName"]', 'Business');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'business@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // Submit with incomplete business data
    await page.click('button:has-text("Register")');
    
    // Check for validation errors on missing required fields
    expect(await page.isVisible('text=Company name is required')).toBeTruthy();
    expect(await page.isVisible('text=Company size is required')).toBeTruthy();
    expect(await page.isVisible('text=Industry is required')).toBeTruthy();
    expect(await page.isVisible('text=Job title is required')).toBeTruthy();
    
    // Check that we're still on the registration page
    await expect(page).toHaveURL(/.*\/register/);
  });
}); 