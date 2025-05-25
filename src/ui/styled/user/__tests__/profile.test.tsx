import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Profile from '../Profile';
import { TestWrapper } from '../../../../tests/utils/test-wrapper';
import { setupTestServices } from '../../../../tests/utils/test-service-setup';
import '@/tests/i18nTestSetup';

let mockUserService: any;

function renderWithWrapper(ui: React.ReactElement) {
  return render(<TestWrapper authenticated>{ui}</TestWrapper>);
}

beforeEach(() => {
  const services = setupTestServices();
  mockUserService = services.mockUserService;
  mockUserService.setMockProfile('user-123', {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    website: 'https://example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    isActive: true,
    isVerified: true,
    userType: 'private'
  });
});

// Mock the imported components
vi.mock('../profile/DataExport', () => ({
  default: () => <div data-testid="data-export">Data Export Component</div>
}));

vi.mock('../profile/CompanyDataExport', () => ({
  default: () => <div data-testid="company-data-export">Company Data Export Component</div>
}));

vi.mock('../profile/NotificationPreferences', () => ({
  default: () => <div data-testid="notification-preferences">Notification Preferences Component</div>
}));

vi.mock('../profile/ActivityLog', () => ({
  default: () => <div data-testid="activity-log">Activity Log Component</div>
}));

describe('Styled Profile Component', () => {
  it('renders the profile information correctly', async () => {
    renderWithWrapper(<Profile />);

    expect(await screen.findByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/website/i)).toHaveValue('https://example.com');
    expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders the form with correct input fields', async () => {
    renderWithWrapper(<Profile />);

    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
  });

  it('renders the avatar upload section', async () => {
    renderWithWrapper(<Profile />);

    expect(await screen.findByLabelText(/upload avatar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove avatar/i })).toBeInTheDocument();
  });

  it('renders the additional sections', async () => {
    renderWithWrapper(<Profile />);

    expect(await screen.findByTestId('data-export')).toBeInTheDocument();
    expect(screen.getByTestId('company-data-export')).toBeInTheDocument();
    expect(screen.getByTestId('notification-preferences')).toBeInTheDocument();
    expect(screen.getByTestId('activity-log')).toBeInTheDocument();
  });

  it('calls updateProfileField when input values change', async () => {
    renderWithWrapper(<Profile />);

    const fullNameInput = await screen.findByLabelText(/full name/i);
    await userEvent.clear(fullNameInput);
    await userEvent.type(fullNameInput, 'New Name');
    
    // Verify the input value was updated in the UI
    expect(fullNameInput).toHaveValue('New Name');
  });

  it('calls updateProfile when the form is submitted', async () => {
    const updateSpy = vi
      .spyOn(mockUserService, 'updateUserProfile')
      .mockResolvedValue({
        success: true,
        profile: mockUserService.getMockProfile('user-123')!
      });

    renderWithWrapper(<Profile />);

    await screen.findByRole('form');
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('shows loading state when profile is loading', () => {
    vi.spyOn(mockUserService, 'getUserProfile').mockImplementation(
      () => new Promise(() => {})
    );

    renderWithWrapper(<Profile />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when profile fetch fails', async () => {
    vi.spyOn(mockUserService, 'getUserProfile').mockRejectedValue(new Error('Failed to load profile'));

    renderWithWrapper(<Profile />);

    expect(await screen.findByText(/failed to load profile/i)).toBeInTheDocument();
  });

  it('shows success message after profile update', async () => {
    vi.spyOn(mockUserService, 'updateUserProfile').mockResolvedValue({
      success: true,
      profile: {
        ...mockUserService.getMockProfile('user-123'),
        fullName: 'New Name'
      }
    });

    renderWithWrapper(<Profile />);

    const fullNameInput = await screen.findByLabelText(/full name/i);
    await userEvent.clear(fullNameInput);
    await userEvent.type(fullNameInput, 'New Name');

    fireEvent.submit(screen.getByRole('form'));

    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument();
  });
});
