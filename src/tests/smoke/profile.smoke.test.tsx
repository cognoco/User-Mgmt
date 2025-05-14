import React from 'react';
import { render, screen } from '../utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ProfilePage from '../../../app/profile/page';

// Define the mock user state
const mockUserState = {
  user: { id: 'test-user', email: 'test@example.com', user_metadata: { first_name: 'Test', last_name: 'User' } },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  handleSessionTimeout: vi.fn(),
  clearError: vi.fn(),
  clearSuccessMessage: vi.fn(),
  setUser: vi.fn(),
  setToken: vi.fn(),
  setupMFA: vi.fn(),
  verifyMFA: vi.fn(),
  disableMFA: vi.fn(),
  sendVerificationEmail: vi.fn(),
  setLoading: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  verifyEmail: vi.fn(),
  mfaEnabled: false,
  mfaSecret: null,
  mfaQrCode: null,
  mfaBackupCodes: null,
  token: 'mock-token',
  rateLimitInfo: null,
  successMessage: null,
};

// Mock the auth store to simulate an authenticated user and provide getState
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: Object.assign(() => mockUserState, {
    getState: () => mockUserState,
    setState: vi.fn(),
  })
}));

// Mock the profile store to provide a valid profile and required methods
vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: () => ({
    profile: {
      id: 'test-user',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      userType: 'PRIVATE',
      companyName: '',
      companySize: null,
      industry: '',
      companyWebsite: '',
      position: '',
      department: '',
      vatId: '',
      address: null,
    },
    isLoading: false,
    error: null,
    fetchProfile: vi.fn(),
    updateBusinessProfile: vi.fn(),
  })
}));

describe('Smoke: Profile Page', () => {
  it('renders profile page for authenticated user', () => {
    render(<ProfilePage />);
    // Check for a heading or user info
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    // Optionally check for user email or avatar if present
  });
}); 