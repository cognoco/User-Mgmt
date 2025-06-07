import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccountSettings } from '@/src/ui/styled/profile/AccountSettings';

let accState: any;

vi.mock('../../../headless/profile/AccountSettings', () => ({
  AccountSettings: ({ render }: any) => render(accState)
}));

describe('AccountSettings styled component', () => {
  beforeEach(() => {
    accState = {
      handlePasswordChange: vi.fn((e: any) => e.preventDefault()),
      handleDeleteAccount: vi.fn(),
      handlePrivacySettingsChange: vi.fn((e: any) => e.preventDefault()),
      handleSecuritySettingsChange: vi.fn((e: any) => e.preventDefault()),
      passwordForm: { currentPassword: '', newPassword: '', confirmPassword: '' },
      updatePasswordForm: vi.fn(),
      deleteAccountConfirmation: '',
      updateDeleteConfirmation: vi.fn(),
      privacySettings: {
        profileVisibility: 'public',
        activityTracking: false,
        communicationEmails: false,
        marketingEmails: false
      },
      securitySettings: {
        twoFactorEnabled: false,
        loginNotifications: false,
        deviceManagement: false
      },
      isSubmitting: false,
      isSuccess: false,
      errors: {},
      touched: { currentPassword: false, newPassword: false, confirmPassword: false },
      handleBlur: vi.fn(),
      sessions: [],
      handleSessionLogout: vi.fn(),
      connectedAccounts: [],
      handleDisconnectAccount: vi.fn(),
      handleConnectAccount: vi.fn(),
      exportData: vi.fn(),
      isExporting: false
    };
  });

  it('submits password form via handler', async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);
    await user.type(screen.getByLabelText('Current Password'), 'old');
    await user.type(screen.getByLabelText('New Password'), 'newpass1A');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpass1A');
    await user.click(screen.getByRole('button', { name: /update password/i }));
    expect(accState.handlePasswordChange).toHaveBeenCalled();
  });

  it('shows success alert when isSuccess is true', () => {
    accState.isSuccess = true;
    render(<AccountSettings />);
    expect(screen.getByText('Settings updated successfully')).toBeInTheDocument();
  });
});
