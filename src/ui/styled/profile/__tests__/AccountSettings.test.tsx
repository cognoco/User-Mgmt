import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccountSettings } from '@/ui/styled/profile/AccountSettings';

let accState: any;

vi.mock('../../../headless/profile/AccountSettings', () => ({
  AccountSettings: ({ render }: any) => render(accState)
}));

describe('AccountSettings styled component', () => {
  beforeEach(() => {
    accState = {
      handleUpdatePreferences: vi.fn((e: any) => e.preventDefault()),
      handleUpdateVisibility: vi.fn((e: any) => e.preventDefault()),
      preferences: {
        language: 'en',
        theme: 'light',
        emailNotifications: {
          marketing: false,
          securityAlerts: false,
          accountUpdates: false,
          teamInvitations: false
        },
        pushNotifications: { enabled: false, events: [] }
      },
      visibility: {
        email: 'private',
        fullName: 'public',
        profilePicture: 'public',
        companyInfo: 'team_only',
        lastLogin: 'private'
      },
      setPreferenceValue: vi.fn(),
      setEmailNotificationValue: vi.fn(),
      setPushNotificationValue: vi.fn(),
      setVisibilityValue: vi.fn(),
      isSubmitting: false,
      errors: {},
      successMessage: undefined,
      availableLanguages: [{ code: 'en', name: 'English' }],
      availableThemes: [{ value: 'light', label: 'Light' }],
      availableVisibilityLevels: [{ value: 'public', label: 'Public' }]
    };
  });

  it('submits preferences form via handler', async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);
    await user.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(accState.handleUpdatePreferences).toHaveBeenCalled();
  });

  it('shows success alert when successMessage is provided', () => {
    accState.successMessage = 'done';
    render(<AccountSettings />);
    expect(screen.getByText('done')).toBeInTheDocument();
  });
});
