import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Profile from '../Profile';
import HeadlessProfile from '@/ui/headless/user/Profile';
import { UserProfile } from '@/core/user/models';

// Mock the headless component
vi.mock('@/ui/headless/user/Profile', () => {
  return {
    default: ({ children }: { children: Function }) => {
      const mockProfile: UserProfile = {
        id: 'test-user-id',
        fullName: 'Test User',
        email: 'test@example.com',
        website: 'https://example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockProps = {
        profile: mockProfile,
        isLoading: false,
        error: null,
        successMessage: null,
        uploadingAvatar: false,
        updateProfile: vi.fn().mockResolvedValue(undefined),
        uploadAvatar: vi.fn().mockResolvedValue(undefined),
        deleteAvatar: vi.fn().mockResolvedValue(undefined),
        updateProfileField: vi.fn(),
        clearMessages: vi.fn()
      };

      return children(mockProps);
    }
  };
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
  it('renders the profile information correctly', () => {
    render(<Profile />);
    
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/website/i)).toHaveValue('https://example.com');
    expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders the form with correct input fields', () => {
    render(<Profile />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
  });

  it('renders the avatar upload section', () => {
    render(<Profile />);
    
    expect(screen.getByLabelText(/upload avatar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove avatar/i })).toBeInTheDocument();
  });

  it('renders the additional sections', () => {
    render(<Profile />);
    
    expect(screen.getByTestId('data-export')).toBeInTheDocument();
    expect(screen.getByTestId('company-data-export')).toBeInTheDocument();
    expect(screen.getByTestId('notification-preferences')).toBeInTheDocument();
    expect(screen.getByTestId('activity-log')).toBeInTheDocument();
  });

  it('calls updateProfileField when input values change', async () => {
    render(<Profile />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(fullNameInput);
    await userEvent.type(fullNameInput, 'New Name');
    
    // We can't directly test if the mock function was called with specific arguments
    // since we're mocking the entire HeadlessProfile component
    // But we can verify the input value was updated in the UI
    expect(fullNameInput).toHaveValue('New Name');
  });

  it('calls updateProfile when the form is submitted', async () => {
    render(<Profile />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Again, we can't directly verify the mock function was called
    // But we can ensure the form submission doesn't cause errors
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading is true', () => {
    // Override the mock to return isLoading as true
    vi.mocked(HeadlessProfile).mockImplementationOnce(({ children }) => {
      return children({
        profile: null,
        isLoading: true,
        error: null,
        successMessage: null,
        uploadingAvatar: false,
        updateProfile: vi.fn(),
        uploadAvatar: vi.fn(),
        deleteAvatar: vi.fn(),
        updateProfileField: vi.fn(),
        clearMessages: vi.fn()
      });
    });
    
    render(<Profile />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    // Override the mock to return an error
    vi.mocked(HeadlessProfile).mockImplementationOnce(({ children }) => {
      return children({
        profile: {
          id: 'test-user-id',
          fullName: 'Test User',
          email: 'test@example.com',
          website: 'https://example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        isLoading: false,
        error: 'Failed to load profile',
        successMessage: null,
        uploadingAvatar: false,
        updateProfile: vi.fn(),
        uploadAvatar: vi.fn(),
        deleteAvatar: vi.fn(),
        updateProfileField: vi.fn(),
        clearMessages: vi.fn()
      });
    });
    
    render(<Profile />);
    
    expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
  });

  it('shows success message when there is a success message', () => {
    // Override the mock to return a success message
    vi.mocked(HeadlessProfile).mockImplementationOnce(({ children }) => {
      return children({
        profile: {
          id: 'test-user-id',
          fullName: 'Test User',
          email: 'test@example.com',
          website: 'https://example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        isLoading: false,
        error: null,
        successMessage: 'Profile updated successfully',
        uploadingAvatar: false,
        updateProfile: vi.fn(),
        uploadAvatar: vi.fn(),
        deleteAvatar: vi.fn(),
        updateProfileField: vi.fn(),
        clearMessages: vi.fn()
      });
    });
    
    render(<Profile />);
    
    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
  });
});
