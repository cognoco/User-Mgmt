import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrivacySettings } from '@/ui/styled/profile/PrivacySettings';
import { useProfile } from '@/hooks/user/useProfile';
import { Profile as DbProfile } from '@/types/database';

// Mock the Supabase client EARLY, before other imports might trigger it
vi.mock('@/lib/supabase');

// Mock the useProfile hook
vi.mock('@/hooks/useProfile');

// Mock UI components used
vi.mock('@/ui/primitives/button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('@/ui/primitives/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/ui/primitives/label', () => ({ Label: (props: any) => <label {...props} /> }));
vi.mock('@/ui/primitives/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={e => onCheckedChange && onCheckedChange(e.target.checked)}
      {...props}
    />
  )
}));
vi.mock('@/ui/primitives/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <select
      data-testid="profile-visibility-select"
      value={value}
      onChange={e => onValueChange && onValueChange(e.target.value)}
      disabled={disabled}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: Object.assign(
    ({ value, children }: { value: string, children: React.ReactNode }) => <option value={value}>{children}</option>,
    { displayName: 'SelectItem' }
  ),
}));

// Mock the useProfile hook directly (alternative to mocking store, depending on useProfile implementation)
// Keep store mock for consistency for now

// Mock profile data
const mockProfile: DbProfile = {
  id: 'user-123',
  userId: 'user-123',
  userType: 'private',
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarUrl: null,
  bio: null,
  location: null,
  website: null,
  phoneNumber: null,
  privacySettings: {
    showEmail: false,
    showPhone: false,
    showLocation: false,
    profileVisibility: 'private',
  },
  companyName: null,
  companyLogoUrl: null,
  companySize: null,
  industry: null,
  companyWebsite: null,
  position: null,
  department: null,
  vatId: null,
  address: null,
};

const mockUpdatePrivacySettings = vi.fn();

describe('PrivacySettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProfile as any).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      updatePrivacySettings: mockUpdatePrivacySettings,
    });
    // Debug: log what useProfile returns
    // eslint-disable-next-line no-console
    console.log('MOCK useProfile:', (useProfile as any).mock.results?.[0]?.value);
  });

  it('should render current privacy settings from profile store', async () => {
    await act(async () => {
      render(<PrivacySettings />);
    });

    // Check profile visibility dropdown
    const visibilitySelect = screen.getByTestId('profile-visibility-select');
    expect(visibilitySelect).toBeInTheDocument();
    expect(visibilitySelect).toHaveValue('private');

    // Check toggles
    expect(screen.getByLabelText(/Show Email Address/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Show Phone Number/i)).not.toBeChecked();
  });

  it('should call updatePrivacySettings with new visibility when dropdown changes', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PrivacySettings />);
    });

    const visibilitySelect = screen.getByTestId('profile-visibility-select');
    await user.selectOptions(visibilitySelect, 'public');

    expect(mockUpdatePrivacySettings).toHaveBeenCalledTimes(1);
    expect(mockUpdatePrivacySettings).toHaveBeenCalledWith({
      ...mockProfile.privacySettings,
      profileVisibility: 'public',
    });
  });

  it('should call updatePrivacySettings with new value when email toggle changes', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PrivacySettings />);
    });

    const emailToggle = screen.getByLabelText(/Show Email Address/i);
    await user.click(emailToggle);

    expect(mockUpdatePrivacySettings).toHaveBeenCalledTimes(1);
    expect(mockUpdatePrivacySettings).toHaveBeenCalledWith({
      ...mockProfile.privacySettings,
      showEmail: true, // Toggled from false to true
    });
  });

  it('should call updatePrivacySettings with new value when phone toggle changes', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PrivacySettings />);
    });

    const phoneToggle = screen.getByLabelText(/Show Phone Number/i);
    await user.click(phoneToggle);

    expect(mockUpdatePrivacySettings).toHaveBeenCalledTimes(1);
    expect(mockUpdatePrivacySettings).toHaveBeenCalledWith({
      ...mockProfile.privacySettings,
      showPhone: true, // Toggled from false to true
    });
  });

}); 
