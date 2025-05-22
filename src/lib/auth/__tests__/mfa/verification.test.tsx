// __tests__/auth/mfa/verification.test.js

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFAVerificationForm } from '@/ui/styled/auth/mfaverification-form';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import { api } from '@/lib/api/axios';
import type { UserEvent } from '@testing-library/user-event';

// Import our standardized mock using vi.mock with dynamic import
vi.mock('@/lib/database/supabase', async () => (await import('@/tests/mocks/supabase')));
import { supabase } from '@/adapters/database/supabase-provider';

describe('MFA Verification During Login', () => {
  let user: UserEvent;
  
  // Mock user with MFA enabled
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    factors: [
      { id: 'totp-123', type: 'totp', friendly_name: 'Authenticator App' },
      { id: 'phone-123', type: 'phone', friendly_name: 'Mobile Phone' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock initial auth (first factor authenticated, second factor required)
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      data: { 
        user: mockUser,
        session: null // No session yet, MFA required
      },
      error: null
    });
    
    // Mock MFA factors list
    (supabase.auth.mfa.listFactors as Mock).mockResolvedValue({
      data: {
        totp: [{ id: 'totp-123', name: 'Authenticator App', verified: true }],
        phone: [{ id: 'phone-123', name: 'Mobile Phone', verified: true }]
      },
      error: null
    });
  });

  test('User can complete login with TOTP code', async () => {
    // Mock api.post for TOTP verification
    const mockApiPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'mfa-verified-token',
      },
    });

    const mockOnSuccess = vi.fn();
    const mockAccessToken = 'initial-access-token';

    render(<MFAVerificationForm accessToken={mockAccessToken} onSuccess={mockOnSuccess} />);

    // Enter TOTP code
    await act(async () => {
      await user.type(screen.getByLabelText(/code/i), '123456');
    });

    // Submit verification form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /verify/i }));
    });

    // Assert api.post was called with correct arguments
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: '123456',
        method: 'totp',
        accessToken: mockAccessToken,
        rememberDevice: false,
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser, 'mfa-verified-token');
    });

    mockApiPost.mockRestore();
  });

  test('User can switch between available MFA methods', async () => {
    // Mock api.post for TOTP and backup code verification
    const mockApiPost = vi.spyOn(api, 'post');
    mockApiPost.mockResolvedValue({
      data: {
        user: mockUser,
        token: 'mfa-verified-token',
      },
    });

    const mockOnSuccessSwitch = vi.fn();
    const mockAccessTokenSwitch = 'initial-access-token-switch';

    render(<MFAVerificationForm accessToken={mockAccessTokenSwitch} onSuccess={mockOnSuccessSwitch} />);

    // Switch to backup code method
    await act(async () => {
      await user.click(screen.getByText((content) => content.includes('useBackupCode')));
    });

    // Enter backup code
    await act(async () => {
      await user.type(screen.getByLabelText((content) => content.includes('backupCodeLabel')), '12345678');
    });

    // Switch back to TOTP method
    await act(async () => {
      await user.click(screen.getByText((content) => content.includes('useTOTPInstead')));
    });

    // Enter TOTP code
    await act(async () => {
      await user.type(screen.getByLabelText(/code/i), '654321');
    });

    // Submit verification form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /verify/i }));
    });

    // Assert api.post was called with correct arguments for TOTP method
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: '654321',
        method: 'totp',
        accessToken: mockAccessTokenSwitch,
        rememberDevice: false,
      });
      expect(mockOnSuccessSwitch).toHaveBeenCalledWith(mockUser, 'mfa-verified-token');
    });

    mockApiPost.mockRestore();
  });

  test('User can authenticate with backup code', async () => {
    const mockApiPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'backup-code-token',
      },
    });

    const mockOnSuccessBackup = vi.fn();
    const mockAccessTokenBackup = 'initial-access-token-backup';

    render(<MFAVerificationForm accessToken={mockAccessTokenBackup} onSuccess={mockOnSuccessBackup} />);

    // Switch to backup code mode
    await act(async () => {
      await user.click(screen.getByText((content) => content.includes('useBackupCode')));
    });

    // Enter backup code
    await act(async () => {
      await user.type(screen.getByLabelText((content) => content.includes('backupCodeLabel')), '12345678');
    });

    // Submit backup code
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /verify/i }));
    });

    // Assert api.post was called with correct arguments
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/api/2fa/backup-codes/verify', {
        code: '12345678',
      });
      expect(mockOnSuccessBackup).toHaveBeenCalledWith({}, '');
    });

    mockApiPost.mockRestore();
  });

  test('Handles incorrect MFA code', async () => {
    // Mock verification failure
    const mockApiPost = vi.spyOn(api, 'post').mockRejectedValueOnce({
      response: { data: { error: 'Invalid verification code' } },
    });

    const mockOnSuccess = vi.fn();
    const mockAccessToken = 'initial-access-token';

    render(<MFAVerificationForm accessToken={mockAccessToken} onSuccess={mockOnSuccess} />);

    // Enter wrong TOTP code
    await act(async () => {
      await user.type(screen.getByLabelText(/code/i), '999999');
    });

    // Submit verification form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /verify/i }));
    });

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
    });

    // User should be able to try again
    expect(screen.getByLabelText(/code/i)).toBeEnabled();

    mockApiPost.mockRestore();
  });

  test('User can request new SMS code during verification', async () => {
    // Mock resend code API call
    const mockApiPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { message: 'New code sent' },
    });

    const mockOnSuccess = vi.fn();
    const mockAccessToken = 'initial-access-token';

    render(
      <MFAVerificationForm
        accessToken={mockAccessToken}
        onSuccess={mockOnSuccess}
        enableResendCode={true}
        mfaMethod="sms"
      />
    );

    // Simulate clicking the resend code button
    await act(async () => {
      await user.click(screen.getByText((content) => content.includes('resendCode')));
    });

    // Verify new challenge was requested
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/mfa/resend-sms', { accessToken: mockAccessToken });
      expect(screen.getByText('[i18n:auth.mfa.resendSuccess]')).toBeInTheDocument();
    });

    mockApiPost.mockRestore();
  });

  test('Handles "Remember this device" functionality', async () => {
    const mockApiPost = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { user: mockUser, token: 'mfa-remembered-token' },
    });

    const mockOnSuccess = vi.fn();
    const mockAccessToken = 'initial-access-token-remember';

    render(
      <MFAVerificationForm
        accessToken={mockAccessToken}
        onSuccess={mockOnSuccess}
        enableRememberDevice={true}
        mfaMethod="totp"
      />
    );

    // Check the remember device box
    await act(async () => {
      await user.click(screen.getByLabelText((content) => content.includes('rememberDevice')));
    });

    // Enter TOTP code
    await act(async () => {
      await user.type(screen.getByLabelText(/code/i), '123456');
    });

    // Submit verification form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /verify/i }));
    });

    // Verify API was called with rememberDevice: true
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: '123456',
        method: 'totp',
        accessToken: mockAccessToken,
        rememberDevice: true,
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser, 'mfa-remembered-token');
    });

    mockApiPost.mockRestore();
  });
});
