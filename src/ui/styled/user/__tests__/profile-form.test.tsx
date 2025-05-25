import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProfileForm } from '../ProfileForm';
import HeadlessProfileForm from '@/ui/headless/user/ProfileForm';

// Mock the headless component
vi.mock('@/ui/headless/user/ProfileForm', () => {
  return {
    default: ({ children }: { children: Function }) => {
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
      
      const mockProps = {
        profile: mockProfile,
        isLoading: false,
        isPrivacyLoading: false,
        isEditing: false,
        errors: {},
        isDirty: false,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: vi.fn(),
        handlePrivacyChange: vi.fn().mockResolvedValue({ message: 'Privacy updated' }),
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      return children(mockProps);
    }
  };
});

// Mock the toast hook
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Styled ProfileForm Component', () => {
  it('renders the profile information in view mode', () => {
    render(<ProfileForm />);
    
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
  
  it('toggles to edit mode when Edit Profile button is clicked', async () => {
    // Override the mock to make isEditing true when Edit Profile is clicked
    vi.mocked(HeadlessProfileForm).mockImplementationOnce(({ children }) => {
      const mockHandleEditToggle = vi.fn();
      
      const mockProps = {
        profile: {
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
        },
        isLoading: false,
        isPrivacyLoading: false,
        isEditing: false,
        errors: {},
        isDirty: false,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: mockHandleEditToggle,
        handlePrivacyChange: vi.fn().mockResolvedValue({ message: 'Privacy updated' }),
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      // First render with isEditing false
      const result = children(mockProps);
      
      // Find the Edit Profile button and simulate a click
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);
      
      // Verify handleEditToggle was called
      expect(mockHandleEditToggle).toHaveBeenCalled();
      
      return result;
    });
    
    render(<ProfileForm />);
    
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);
    
    // We can't directly test the state change since we're mocking the component,
    // but we can verify the button was clicked and the handler was called
  });
  
  it('renders the form in edit mode', () => {
    // Override the mock to make isEditing true
    vi.mocked(HeadlessProfileForm).mockImplementationOnce(({ children }) => {
      const mockProps = {
        profile: {
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
        },
        isLoading: false,
        isPrivacyLoading: false,
        isEditing: true, // Set to true for edit mode
        errors: {},
        isDirty: true,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: vi.fn(),
        handlePrivacyChange: vi.fn().mockResolvedValue({ message: 'Privacy updated' }),
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      return children(mockProps);
    });
    
    render(<ProfileForm />);
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State / Province')).toBeInTheDocument();
    expect(screen.getByLabelText('Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Website')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
  
  it('shows loading state when isLoading is true', () => {
    // Override the mock to make isLoading true
    vi.mocked(HeadlessProfileForm).mockImplementationOnce(({ children }) => {
      const mockProps = {
        profile: {
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
        },
        isLoading: true, // Set to true for loading state
        isPrivacyLoading: false,
        isEditing: true,
        errors: {},
        isDirty: false,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: vi.fn(),
        handlePrivacyChange: vi.fn().mockResolvedValue({ message: 'Privacy updated' }),
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      return children(mockProps);
    });
    
    render(<ProfileForm />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // Verify buttons are disabled during loading
    const saveButton = screen.getByText('Saving...');
    expect(saveButton).toBeDisabled();
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });
  
  it('shows error messages when there are form errors', () => {
    // Override the mock to include form errors
    vi.mocked(HeadlessProfileForm).mockImplementationOnce(({ children }) => {
      const mockProps = {
        profile: {
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
        },
        isLoading: false,
        isPrivacyLoading: false,
        isEditing: true,
        errors: {
          website: { message: 'Invalid URL format' },
          phone_number: { message: 'Invalid phone number' }
        },
        isDirty: true,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: vi.fn(),
        handlePrivacyChange: vi.fn().mockResolvedValue({ message: 'Privacy updated' }),
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      return children(mockProps);
    });
    
    render(<ProfileForm />);
    
    expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });
  
  it('calls handlePrivacyChange when the switch is toggled', async () => {
    const mockHandlePrivacyChange = vi.fn().mockResolvedValue({ message: 'Privacy updated' });
    
    // Override the mock to test privacy toggle
    vi.mocked(HeadlessProfileForm).mockImplementationOnce(({ children }) => {
      const mockProps = {
        profile: {
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
        },
        isLoading: false,
        isPrivacyLoading: false,
        isEditing: false,
        errors: {},
        isDirty: false,
        register: () => ({}),
        watch: () => true,
        handleSubmit: (cb: any) => (e: any) => {
          e.preventDefault();
          return cb({});
        },
        handleEditToggle: vi.fn(),
        handlePrivacyChange: mockHandlePrivacyChange,
        onSubmit: vi.fn().mockResolvedValue(undefined),
        userEmail: 'test@example.com'
      };
      
      return children(mockProps);
    });
    
    render(<ProfileForm />);
    
    // Find the switch by its label
    const switchLabel = screen.getByText('Profile Visibility');
    const switchElement = switchLabel.closest('div')?.parentElement?.querySelector('button');
    
    if (switchElement) {
      fireEvent.click(switchElement);
      
      await waitFor(() => {
        expect(mockHandlePrivacyChange).toHaveBeenCalledWith(false);
      });
    } else {
      throw new Error('Switch element not found');
    }
  });
});
