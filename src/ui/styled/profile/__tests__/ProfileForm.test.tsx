import React from 'react';
import { render, screen } from '@/tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ProfileForm } from '../ProfileForm';
import { createMockProfileStore } from '@/tests/mocks/profile.store.mock';

// Mock dependencies
vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: () => ({
    profile: {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Old bio',
      email: 'john@example.com',
      is_public: true
    },
    isLoading: false,
    error: null,
    fetchProfile: vi.fn(),
    updateProfile: vi.fn()
  }),
}));

// Mock the auth hook - this is what we're testing
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ 
    user: { email: 'user@example.com' },
    isLoading: false
  }),
}));

// Mock the toast component
vi.mock('@/ui/primitives/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('ProfileForm component', () => {
  it('renders with auth hook data', () => {
    render(<ProfileForm />);
    
    // Verify the component renders with the email from the auth hook
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});
