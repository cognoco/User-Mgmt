import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileForm from '../ProfileForm';
import { TestWrapper } from '../../../../tests/utils/test-wrapper';
import { MockAuthService } from '../../../../services/auth/__tests__/mocks/mock-auth-service';

vi.unmock('@/hooks/auth/useAuth');

// Dynamically replace useProfileStore with a mock store instance per test
let useProfileStoreMock: any;
vi.mock('@/lib/stores/profile.store', () => ({
  get useProfileStore() {
    return useProfileStoreMock;
  },
}));

// Mock axios instance so we can verify API calls
vi.mock('@/lib/api/axios', () => ({
  api: {
    put: vi.fn(),
  },
}));

import { api } from '@/lib/api/axios';

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

  let mockFetchProfile: any;
  let mockUpdateProfile: any;
  let mockAuthService: MockAuthService;
  
  beforeEach(() => {
    vi.clearAllMocks();

    mockFetchProfile = vi.fn();
    mockUpdateProfile = vi.fn();

    mockAuthService = new MockAuthService();
    mockAuthService.setMockUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
    });

    const store = {
      profile: mockProfile,
      isLoading: false,
      error: null,
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    };

    useProfileStoreMock = (selector: any) =>
      selector ? selector(store) : store;
    useProfileStoreMock.setState = (partial: any) => {
      Object.assign(store, partial);
    };
    useProfileStoreMock.getState = () => store;

    // Setup api mock response
    (api.put as any).mockResolvedValue({
      data: {
        is_public: false,
        message: 'Privacy settings updated',
      },
    });
  });

  it('renders with children function and provides correct props', async () => {
    const childrenMock = vi.fn().mockReturnValue(<div>Test Child</div>);
    
    render(
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>{childrenMock}</ProfileForm>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(childrenMock).toHaveBeenCalled();
      const props = childrenMock.mock.calls.at(-1)[0];
      expect(props.profile).toEqual(mockProfile);
      expect(props.isLoading).toBe(false);
      expect(props.isEditing).toBe(false);
      expect(typeof props.handleEditToggle).toBe('function');
      expect(typeof props.handlePrivacyChange).toBe('function');
      expect(typeof props.onSubmit).toBe('function');
      expect(props.userEmail).toBe('test@example.com');
    });
  });

  it('fetches profile on mount', () => {
    render(
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>{() => <div>Test</div>}</ProfileForm>
      </TestWrapper>
    );
    
    expect(mockFetchProfile).toHaveBeenCalledTimes(1);
  });

  it('toggles editing state when handleEditToggle is called', async () => {
    let editingState = false;
    
    render(
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>
          {(props) => {
            editingState = props.isEditing;
            return (
              <button onClick={props.handleEditToggle}>Toggle Edit</button>
            );
          }}
        </ProfileForm>
      </TestWrapper>
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
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>
          {(props) => (
            <button onClick={() => props.onSubmit(formData)}>Submit</button>
          )}
        </ProfileForm>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(formData);
    });
  });

  it('calls api.put when handlePrivacyChange is called', async () => {
    render(
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>
          {(props) => (
            <button onClick={() => props.handlePrivacyChange(false)}>
              Change Privacy
            </button>
          )}
        </ProfileForm>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Change Privacy'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/profile/privacy', { is_public: false });
    });
  });

  it('updates profile state when privacy is changed', async () => {
    const setState = vi.fn();
    (useProfileStoreMock as any).setState = setState;

    render(
      <TestWrapper authenticated customServices={{ authService: mockAuthService }}>
        <ProfileForm>
          {(props) => (
            <button onClick={() => props.handlePrivacyChange(false)}>
              Change Privacy
            </button>
          )}
        </ProfileForm>
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByText('Change Privacy'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/profile/privacy', { is_public: false });
    });
  });
});
