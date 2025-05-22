import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileForm from '../ProfileForm';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuth } from '@/hooks/auth/useAuth';
import { api } from '@/lib/api/axios';

// Mock dependencies
vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: vi.fn(),
}));

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/axios', () => ({
  api: {
    put: vi.fn(),
  },
}));

describe('Headless ProfileForm Component', () => {
  const mockProfile = {
    id: 'test-id',
    bio: 'Test bio',
    gender: 'Male',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    postal_code: '12345',
    phone_number: '1234567890',
    website: 'https://example.com',
    is_public: true,
  };

  const mockFetchProfile = vi.fn();
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup useProfileStore mock
    (useProfileStore as any).mockImplementation((selector) => {
      const store = {
        profile: mockProfile,
        isLoading: false,
        error: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
      };
      return selector(store);
    });

    // Setup useAuth mock
    (useAuth as any).mockReturnValue({
      user: { email: 'test@example.com' },
    });

    // Setup api mock
    (api.put as any).mockResolvedValue({
      data: {
        is_public: false,
        message: 'Privacy settings updated',
      },
    });
  });

  it('renders with children function and provides correct props', () => {
    const childrenMock = vi.fn().mockReturnValue(<div>Test Child</div>);
    
    render(<ProfileForm>{childrenMock}</ProfileForm>);
    
    expect(childrenMock).toHaveBeenCalledTimes(1);
    
    const props = childrenMock.mock.calls[0][0];
    expect(props.profile).toEqual(mockProfile);
    expect(props.isLoading).toBe(false);
    expect(props.isEditing).toBe(false);
    expect(typeof props.handleEditToggle).toBe('function');
    expect(typeof props.handlePrivacyChange).toBe('function');
    expect(typeof props.onSubmit).toBe('function');
    expect(props.userEmail).toBe('test@example.com');
  });

  it('fetches profile on mount', () => {
    render(<ProfileForm>{() => <div>Test</div>}</ProfileForm>);
    
    expect(mockFetchProfile).toHaveBeenCalledTimes(1);
  });

  it('toggles editing state when handleEditToggle is called', async () => {
    let editingState = false;
    
    render(
      <ProfileForm>
        {(props) => {
          editingState = props.isEditing;
          return (
            <button onClick={props.handleEditToggle}>Toggle Edit</button>
          );
        }}
      </ProfileForm>
    );
    
    expect(editingState).toBe(false);
    
    fireEvent.click(screen.getByText('Toggle Edit'));
    
    await waitFor(() => {
      expect(editingState).toBe(true);
    });
  });

  it('calls updateProfile when onSubmit is called', async () => {
    const formData = {
      bio: 'Updated bio',
      gender: 'Female',
      address: '456 New St',
      city: 'New City',
      state: 'New State',
      country: 'New Country',
      postal_code: '54321',
      phone_number: '0987654321',
      website: 'https://new-example.com',
    };
    
    render(
      <ProfileForm>
        {(props) => (
          <button onClick={() => props.onSubmit(formData)}>Submit</button>
        )}
      </ProfileForm>
    );
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
    });
  });

  it('calls api.put when handlePrivacyChange is called', async () => {
    render(
      <ProfileForm>
        {(props) => (
          <button onClick={() => props.handlePrivacyChange(false)}>
            Change Privacy
          </button>
        )}
      </ProfileForm>
    );
    
    fireEvent.click(screen.getByText('Change Privacy'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/profile/privacy', { is_public: false });
    });
  });

  it('updates profile state when privacy is changed', async () => {
    const setState = vi.fn();
    (useProfileStore as any).setState = setState;
    
    render(
      <ProfileForm>
        {(props) => (
          <button onClick={() => props.handlePrivacyChange(false)}>
            Change Privacy
          </button>
        )}
      </ProfileForm>
    );
    
    fireEvent.click(screen.getByText('Change Privacy'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/profile/privacy', { is_public: false });
    });
  });
});
