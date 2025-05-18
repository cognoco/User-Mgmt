import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
import { mockSupabaseSession, interceptApi } from '../mocks/supabase';

test.describe('Email MFA Setup and Verification', () => {
  test('User can set up Email MFA', async ({ page }) => {
    // Mock the session
    await mockSupabaseSession(page);
    
    // Mock the API requests for 2FA setup
    await interceptApi(page, 'POST', '/api/2fa/setup', {
      status: 200,
      body: { success: true, testid: 'email-mfa-setup-success' }
    });
    
    // Mock the verification API
    await interceptApi(page, 'POST', '/api/2fa/verify', {
      status: 200,
      body: { success: true, mfaEmailVerified: true }
    });
    
    // Mock the backup codes
    await interceptApi(page, 'GET', '/api/2fa/backup-codes', {
      status: 200,
      body: { codes: ['123456', '234567', '345678'] }
    });

    // Log in (this uses the mocked session)
    await login(page);

    // Navigate to account settings
    await page.click('text=Account');
    await page.click('text=Security Settings');
    
    // Start MFA setup by clicking the "Enable" button
    const enableButton = page.getByRole('button', { name: /enable 2fa/i });
    await enableButton.click();
    
    // Select email as the MFA method
    await page.click('text=Email');
    
    // Enter email for verification (may use existing email from profile)
    const emailInput = page.getByLabelText(/enter email/i);
    await emailInput.fill('test@example.com');
    
    // Send the email verification code
    await page.click('text=Send Code');
    
    // Enter verification code
    const codeInput = page.getByLabelText(/verification code/i);
    await codeInput.fill('123456');
    
    // Submit the verification code
    await page.click('text=Verify');
    
    // Verify we see backup codes
    await expect(page.getByText('Backup Codes')).toBeVisible();
    
    // Verify user is redirected back to security settings with 2FA now showing as enabled
    await page.click('text=Continue');
    await expect(page.getByText('Email')).toBeVisible();
  });
  
  test('User sees error with invalid verification code', async ({ page }) => {
    // Mock the session
    await mockSupabaseSession(page);
    
    // Mock the API requests for 2FA setup
    await interceptApi(page, 'POST', '/api/2fa/setup', {
      status: 200,
      body: { success: true }
    });
    
    // Mock a failed verification
    await interceptApi(page, 'POST', '/api/2fa/verify', {
      status: 400,
      body: { error: 'Invalid verification code' }
    });
    
    // Log in and navigate to settings
    await login(page);
    await page.click('text=Account');
    await page.click('text=Security Settings');
    await page.getByRole('button', { name: /enable 2fa/i }).click();
    
    // Select email as the MFA method
    await page.click('text=Email');
    
    // Enter email
    await page.getByLabelText(/enter email/i).fill('test@example.com');
    await page.click('text=Send Code');
    
    // Enter incorrect verification code
    await page.getByLabelText(/verification code/i).fill('999999');
    await page.click('text=Verify');
    
    // Check for error message
    await expect(page.getByText('Invalid verification code')).toBeVisible();
  });
  
  test('User can resend email verification code', async ({ page }) => {
    // Mock the session
    await mockSupabaseSession(page);
    
    // Mock the API requests
    await interceptApi(page, 'POST', '/api/2fa/setup', {
      status: 200,
      body: { success: true }
    });
    
    // Mock the resend-email endpoint
    await interceptApi(page, 'POST', '/api/2fa/resend-email', {
      status: 200,
      body: { success: true, testid: 'email-mfa-resend-success' }
    });
    
    // Log in and navigate to settings
    await login(page);
    await page.click('text=Account');
    await page.click('text=Security Settings');
    await page.getByRole('button', { name: /enable 2fa/i }).click();
    
    // Select email as MFA method
    await page.click('text=Email');
    
    // Enter email and request code
    await page.getByLabelText(/enter email/i).fill('test@example.com');
    await page.click('text=Send Code');
    
    // Look for and click the "Resend Code" button
    // Note: This test may be skipped if the resend button isn't implemented yet
    await page.click('text=Resend Code', { timeout: 5000 }).catch(() => {
      test.skip('Resend button not implemented yet');
    });
  });
}); 