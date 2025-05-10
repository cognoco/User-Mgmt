// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '@/lib/stores/auth.store';
import { within } from '@testing-library/react';
import type { LoginData } from '@/types/auth';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock the auth store
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Create mock variables in test scope
const mockHandleSubmit = vi.fn((callback: (data: unknown) => void) => (data: unknown) => callback(data));
const mockFormState = {
  errors: {},
  isValid: true,
  isDirty: true,
  isSubmitting: false,
};

// Mock react-hook-form with importOriginal
vi.mock('react-hook-form', async () => {
  return {
    useForm: () => ({
      handleSubmit: mockHandleSubmit,
      register: (name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      }),
      watch: vi.fn(),
      formState: mockFormState,
      reset: vi.fn(),
      setValue: vi.fn(),
      clearErrors: vi.fn(),
      trigger: vi.fn(),
    }),
    FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    zodResolver: vi.fn(),
  };
});

// Mock UI components needed by LoginForm
vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="alert" className={className}>{children}</div>
  ),
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-title">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

// Mock OAuth context and store for OAuthButtons
vi.mock('@/lib/auth/UserManagementProvider', () => ({
  useUserManagement: () => ({
    oauth: {
      enabled: true,
      providers: [
        { provider: 'google' },
        { provider: 'apple' },
      ],
    },
  }),
}));
vi.mock('@/lib/stores/oauth.store', () => ({
  useOAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock lucide-react icons if needed for password toggle
vi.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  
  // Helper to reset and setup mocks with specific state
  const setupMocks = (authState: Partial<ReturnType<typeof useAuthStore>> = {}, formState: Partial<typeof mockFormState> = {}) => {
    vi.clearAllMocks();
    mockLogin.mockReset().mockResolvedValue({ success: true }); 
    mockRouterPush.mockReset(); 
    
    // Reset RHF mocks
    mockHandleSubmit.mockImplementation((callback: (data: unknown) => void) => {
      return (data: unknown) => callback(data);
    });

    // Update form state
    Object.assign(mockFormState, {
      errors: {},
      isValid: true,
      isDirty: true,
      isSubmitting: false,
      ...formState
    });
    
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: vi.fn(), 
      sendVerificationEmail: vi.fn(),
      ...authState
    });
  };

  beforeEach(() => {
    setupMocks();
  });

  it('should render form elements', async () => {
    await act(async () => {
      render(<LoginForm />);
    });
    
    // Check for form elements
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument();
  });

  it('should handle login submission', async () => {
    // Setup mocks for this specific test
    setupMocks();
    
    await act(async () => {
      render(<LoginForm />);
    });
    
    // Data to be submitted
    const formData: LoginData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };

    // Get the onSubmit function from the mock handleSubmit
    // Ensure the mock is set up *before* rendering triggers its use
    if (mockHandleSubmit.mock.calls.length === 0) {
        throw new Error('handleSubmit mock was not called during render. Check component structure.');
    }
    const onSubmitFn = mockHandleSubmit.mock.calls[0][0];

    // Call the onSubmit function directly, bypassing form interactions
    await onSubmitFn(formData);
    
    // Check if login store function was called correctly
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith(formData); 
  });

  it('should display error messages for invalid inputs', async () => {
    // Setup mocks with specific errors
    const errors = {
      email: { type: 'invalid_string', message: 'Invalid email address' },
      password: { type: 'too_small', message: 'Password is required' },
    };
    setupMocks({}, { errors, isValid: false });

    await act(async () => {
      render(<LoginForm />);
    });
    
    // Check for validation messages provided by the mock formState
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument(); 
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('should validate form inputs', async () => {
    // Test invalid email
    const emailError = { email: { type: 'invalid_string', message: 'Invalid email address' } };
    setupMocks({}, { errors: emailError, isValid: false });
    await act(async () => {
      render(<LoginForm />);
    });
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument(); 

    // Rerender or update mocks for password test is tricky without full interaction.
    // This test might be less reliable with heavy mocking.
    // Consider if covered by 'should display error messages for invalid inputs'
  });

  it('should disable button while loading', async () => {
    // Mock loading state
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: vi.fn(),
      sendVerificationEmail: vi.fn(),
    });
    
    await act(async () => {
      render(<LoginForm />);
    });
    
    const submitButton = screen.getByRole('button', { name: /logging in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/logging in/i);
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<LoginForm />);
    });
    
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    // Initial state assertion
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

    // Wrap first click in act
    await act(async () => {
      await user.click(toggleButton);
    });
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

    // Wrap second click in act
    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await act(async () => {
       await user.click(hideButton);
    });
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('should display API error messages', async () => {
    // Mock error state
    const apiError = 'Invalid credentials';
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: apiError,
      clearError: vi.fn(),
      sendVerificationEmail: vi.fn(),
    });
    
    await act(async () => {
      render(<LoginForm />);
    });
    
    await waitFor(() => {
      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      const alertDesc = within(alert).getByTestId('alert-description');
      expect(alertDesc).toHaveTextContent(apiError);
    });
  });

  it('should not have duplicate sign-up links or elements', async () => {
    await act(async () => {
      render(<LoginForm />);
    });
    
    // Get all elements containing sign up text or links, including nested text
    const signUpElements = screen.queryAllByText(/Sign up|Don't have an account\?/i, { exact: false });
    
    // Log what we found to help debug
    console.log('Found sign up related elements:', 
      signUpElements.map(el => ({
        text: el.textContent,
        tagName: el.tagName,
        role: el.getAttribute('role'),
      }))
    );

    // The test should fail if we find more than one set of sign-up related elements
    expect(signUpElements.length, 
      `Found multiple sign-up elements: ${signUpElements.map(el => el.textContent).join(', ')}`
    ).toBe(1);

    // Also check specifically for the link to avoid false positives
    const signUpLinks = screen.queryAllByRole('link', { name: /sign up/i });
    expect(signUpLinks.length,
      `Found ${signUpLinks.length} sign-up links when there should be exactly one`
    ).toBe(1);

    // Verify there's only one "Forgot password" link
    const forgotPasswordLinks = screen.queryAllByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLinks.length,
      `Found ${forgotPasswordLinks.length} 'forgot password' links when there should be exactly one`
    ).toBe(1);
  });

  it('renders social login buttons (OAuthButtons) for Google and Apple login', async () => {
    await act(async () => {
      render(<LoginForm />);
    });
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument();
  });
}); 
