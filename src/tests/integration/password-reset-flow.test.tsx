// __tests__/integration/password-reset-flow.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Import and mock Supabase
vi.mock('@/lib/supabase', () => require('../mocks/supabase'));
import { supabase } from '@/lib/supabase';

// Store original window location
const originalLocation = window.location;

describe('Password Reset Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Mock window.location hash - needed for reset flow
    // Define a mock assign function if needed for other tests
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash: '',
        assign: vi.fn(),
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore original window.location
     Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
    });
  });

  test('User can request password reset', async () => {
    // This test seems to belong more to ForgotPasswordForm, 
    // but we'll keep it here for now and adjust if needed.
    // Assume ResetPasswordForm handles both request and update based on context (e.g., URL hash)
    // Mock successful password reset request
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValueOnce({
      data: {},
      error: null
    });

    // Render password reset component
    render(<ResetPasswordForm />);

    // Fill in email (Assuming ResetPasswordForm has an email field initially)
    // If it ONLY handles the update part, this test needs moving/refactoring
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'user@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    // Verify password reset was called
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      { redirectTo: expect.any(String) }
    );

    // Success message should be displayed
    await waitFor(() => {
      // Message might differ in ResetPasswordForm vs ForgotPasswordForm
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  test('User sees error if reset fails', async () => {
    // Mock failed password reset request
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email not found' }
    });
    
    // Render password reset component
    render(<ResetPasswordForm />);
    
    // Fill in email
    await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /reset password/i }));
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });

  test('User can set new password after reset', async () => {
    // Mock URL with reset token
    // This would normally be handled by the router
    window.location.hash = '#access_token=test-token&type=recovery';
    
    // Mock successful password update
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: { user: { id: 'user-id' } },
      error: null
    });
    
    // Render password reset component (should detect token)
    render(<ResetPasswordForm />);
    
    // New password form should be displayed
    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
    
    // Fill in new password
    await user.type(screen.getByLabelText(/new password/i), 'NewPassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'NewPassword123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update password/i }));
    
    // Verify password update was called
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewPassword123'
    });
    
    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/password updated/i)).toBeInTheDocument();
    });
    
    // Clean up
    window.location.hash = '';
  });

  test('Password validation works on reset', async () => {
    // Mock URL with reset token
    window.location.hash = '#access_token=test-token&type=recovery';
    
    // Render password reset component
    render(<ResetPasswordForm />);
    
    // Fill in mismatched passwords
    await user.type(screen.getByLabelText(/new password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update password/i }));
    
    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Supabase should not be called
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    
    // Clean up
    window.location.hash = '';
  });
});
