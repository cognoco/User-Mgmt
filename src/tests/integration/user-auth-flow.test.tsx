// __tests__/integration/user-auth-flow.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Import specific forms instead of generic Auth
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProfileEditor } from '@/components/profile/ProfileEditor'; // Assuming ProfileEditor handles profile updates
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'; // Add SpyInstance
// Remove the module mock for auth.store
// vi.mock('@/lib/stores/auth.store', () => ({ ... })); 

// Import the actual store
// import { useAuthStore } from '@/lib/stores/auth.store';

// Mock Supabase (using factory with dynamic import)
vi.mock('@/lib/supabase', async (/* importOriginal */) => {
  // Import the actual mock implementation using dynamic import
  const mockModule = await vi.importActual('@/tests/mocks/supabase') as { supabase: any }; 
  return {
    supabase: mockModule.supabase, // Return the mocked supabase object
    // Include other exports from the original module if needed
  };
});
// Import the mocked supabase instance (Vitest redirects this)
import { supabase } from '@/lib/supabase';

// Import Profile type
import type { Profile } from '@/types/profile'; // Assuming type exists here
import type { User, RateLimitInfo } from '@/types/auth'; // Import types
// If ConnectedAccount is only used as a type, re-import it from the correct alias
import type { ConnectedAccount } from '@/types/connected-accounts';

// --- Mock Profile Store with exported state object ---
const mockProfileStoreActions = {
  profile: null as Profile | null, // Allow Profile or null
  isLoading: false,
  error: null as string | null,
  fetchProfile: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  uploadAvatar: vi.fn().mockResolvedValue('mock-avatar-url'),
  removeAvatar: vi.fn().mockResolvedValue(true),
  updateBusinessProfile: vi.fn().mockResolvedValue(undefined),
  convertToBusinessProfile: vi.fn().mockResolvedValue(undefined),
  uploadCompanyLogo: vi.fn().mockResolvedValue('mock-logo-url'),
  removeCompanyLogo: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
  // Add any other methods if needed
};

vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: vi.fn(() => mockProfileStoreActions)
}));
// --- End Profile Store Mock ---

// --- Mock Connected Accounts Store ---
// import { useConnectedAccountsStore } from '@/lib/stores/connected-accounts.store';
// import { ConnectedAccount } from '@/types/connected-accounts';
// import { OAuthProvider } from '@/types/oauth';

import { createConnectedAccountsStoreMock } from '@/tests/mocks/connected-accounts.store.mock';

let mockConnectedAccountsStoreActions = createConnectedAccountsStoreMock();

vi.mock('@/lib/stores/connected-accounts.store', () => ({
  useConnectedAccountsStore: vi.fn(() => mockConnectedAccountsStoreActions)
}));
// --- End Connected Accounts Store Mock ---

// --- Revert to vi.mock for Auth Store with exported mock state ---
const mockAuthStoreActions = {
  user: null as User | null, // Use type assertion for initial null
  token: null as string | null,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  successMessage: null as string | null, // Allow string type
  rateLimitInfo: null as RateLimitInfo | null,
  mfaEnabled: false,
  mfaSecret: null as string | null,
  mfaQrCode: null as string | null,
  mfaBackupCodes: null as string[] | null,
  // Remove explicit function types - let TS infer from vi.fn()
  login: vi.fn().mockImplementation(async (payload) => {
    console.log('[DEBUG] Mocked login via exported state CALLED:', payload);
    mockAuthStoreActions.user = { id: 'test-user-id', email: payload.email } as User;
    mockAuthStoreActions.isAuthenticated = true;
    return { success: true, requiresMfa: false };
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockImplementation(async (payload) => {
    console.log('[DEBUG] Mocked register via exported state CALLED:', payload);
    mockAuthStoreActions.successMessage = 'Registration successful. Please check your email.';
    return { success: true };
  }),
  refreshToken: vi.fn().mockResolvedValue(true),
  handleSessionTimeout: vi.fn(),
  clearError: vi.fn().mockImplementation(() => { mockAuthStoreActions.error = null; }),
  clearSuccessMessage: vi.fn().mockImplementation(() => { mockAuthStoreActions.successMessage = null; }),
  setUser: vi.fn((user: User | null) => { mockAuthStoreActions.user = user; }),
  setToken: vi.fn((token: string | null) => { mockAuthStoreActions.token = token; }),
  setupMFA: vi.fn().mockResolvedValue({ success: true }),
  verifyMFA: vi.fn().mockResolvedValue({ success: true }),
  disableMFA: vi.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  setLoading: vi.fn((loading: boolean) => { mockAuthStoreActions.isLoading = loading; }),
  resetPassword: vi.fn().mockResolvedValue({ success: true }),
  updatePassword: vi.fn().mockResolvedValue({ success: true }),
  deleteAccount: vi.fn().mockResolvedValue({ success: true }),
  verifyEmail: vi.fn().mockResolvedValue({ success: true }),
};

vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn(() => mockAuthStoreActions)
}));
// --- End Auth Store Mock ---

describe('User Authentication Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  // Remove spy variable
  // let loginSpy: SpyInstance;

  beforeEach(() => {
    // Clear mock call history and reset state if necessary
    vi.clearAllMocks(); 
    // Reset mock state manually if needed between tests
    mockAuthStoreActions.user = null;
    mockAuthStoreActions.token = null;
    mockAuthStoreActions.isAuthenticated = false;
    mockAuthStoreActions.error = null;
    mockAuthStoreActions.successMessage = null;
    mockAuthStoreActions.isLoading = false;
    // Reset connected accounts store state
    mockConnectedAccountsStoreActions = createConnectedAccountsStoreMock();
    // Reset profile store state
    mockProfileStoreActions.profile = null;
    mockProfileStoreActions.isLoading = false;
    mockProfileStoreActions.error = null;
    
    user = userEvent.setup();
  });

  // Add afterEach if timers or other global mocks need restoring
  afterEach(() => {
    // vi.restoreAllMocks(); // Not needed if only using vi.mock module mocks
  });

  test('User can sign up, login, and update profile', async () => {
    // Get refs to mock functions from the exported objects
    const mockLogin = mockAuthStoreActions.login;
    const mockRegister = mockAuthStoreActions.register;
    const mockUpdateProfile = mockProfileStoreActions.updateProfile;
    // Add mockUploadAvatar if we want to test that too
    // const mockUploadAvatar = mockProfileStoreActions.uploadAvatar;

    // 1. SIGN UP FLOW
    const { unmount: unmountSignup } = render(<RegistrationForm />); 

    // Fill sign up form
    await act(async () => {
      await user.type(screen.getByLabelText(/email \*/i), 'test@example.com');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/^Password \*$/i), 'Password123');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/first name \*/i), 'Test');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/last name \*/i), 'User');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/^Confirm Password \*$/i), 'Password123');
    });
    await act(async () => {
      await user.click(screen.getByRole('checkbox', { name: /accept terms/i }));
    });

    // Submit sign up form 
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /create account/i }));
    });

    // Verify mockRegister was called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
      // Optional: Check arguments if needed
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com', 
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      }));
    });
    // Check for success message (can check state or UI)
    // expect(mockAuthStoreActions.successMessage).toContain(...); // Check state
    expect(await screen.findByRole('alert')).toHaveTextContent(/Registration successful/i); // Check UI

    unmountSignup();

    // 2. LOGIN FLOW
    const { unmount: unmountLogin } = render(<LoginForm />); 

    // Fill login form
    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/^Password$/i), 'Password123');
    });

    // Submit login form (use act)
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /login/i }));
    });

    // Check the mockLogin function from the imported object
    expect(mockLogin, 'Expected login function from exported mock state to be called').toHaveBeenCalled();
    expect(mockLogin, 'Expected login function to be called with specific arguments').toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
      rememberMe: false, // Include rememberMe based on defaultValues in LoginForm
    });

    unmountLogin();

    // 3. PROFILE UPDATE FLOW
    // Supabase mocks for getUser are still needed by ProfileEditor potentially
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
      error: null
    });
    // No need to mock supabase.from('profiles')... calls directly anymore
    // const profileQueryBuilder = supabase.from('profiles');
    // ((profileQueryBuilder as any).single as any).mockResolvedValueOnce({ ... });
    // (supabase.from as any)('profiles').upsert.mockResolvedValueOnce({ error: null });

    // Simulate profile existing in the store. 
    // ProfileEditor likely uses auth user for email and maybe defaults name internally.
    // Only include fields from Profile type that might be read initially.
    mockProfileStoreActions.profile = {
      id: 'test-user-id',
      bio: '', 
      website: '',
      avatar_url: null,
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(), 
    };

    render(<ProfileEditor />);

    // Wait for editor to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      // Add check for email field
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); 
    });

    // Fill and submit profile form
    // Ensure email field is populated to pass validation
    await user.type(screen.getByLabelText(/email/i), 'test@example.com'); 
    
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'Test User Updated');
    await user.clear(screen.getByLabelText(/website/i));
    await user.type(screen.getByLabelText(/website/i), 'https://updated.example.com');
    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), 'Test bio');
    await user.clear(screen.getByLabelText(/location/i));
    await user.type(screen.getByLabelText(/location/i), 'Test location');

    // Wrap the submission click in act
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save profile/i }));
    });

    // Verify profile store updateProfile was called with the FORM data payload
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Test User Updated',
        email: 'test@example.com', 
        bio: 'Test bio', 
        location: 'Test location', // Expect location based on previous error msg
        website: 'https://updated.example.com',
      });
    });
  });

  test('Social login buttons (Google/Apple) are visible in Login and Registration forms', async () => {
    // Registration Form
    const { unmount: unmountSignup } = render(<RegistrationForm />);
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up with apple/i })).toBeInTheDocument();
    unmountSignup();

    // Login Form
    const { unmount: unmountLogin } = render(<LoginForm />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument();
    unmountLogin();
  });
});
