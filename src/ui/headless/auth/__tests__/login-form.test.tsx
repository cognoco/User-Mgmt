// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { useAuth } from '@/hooks/auth/useAuth';
import type { LoginData } from '@/types/auth';
import * as React from 'react';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock the auth store
vi.mock('@/hooks/auth/use-auth', () => ({
  useAuth: vi.fn()
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
vi.mock('@/ui/primitives/alert', () => ({
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
}));

function setupAuth(overrides: Record<string, any> = {}) {
  const mockLogin = vi.fn().mockResolvedValue({ success: true });
  (useAuth as any).mockReturnValue({
    login: mockLogin,
    isLoading: false,
    error: null,
    ...overrides,
  });
  return { mockLogin };
}

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  // Helper to reset and setup mocks with specific state
  const setupMocks = (authState: Partial<ReturnType<typeof useAuth>> = {}, formState: Partial<typeof mockFormState> = {}) => {
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
    
    // Always provide clearError as a function
    const authMock = {
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: vi.fn(),
      sendVerificationEmail: vi.fn(),
      setUser: vi.fn(),
      setToken: vi.fn(),
      ...authState
    };
    setupAuthStoreMock(authMock);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login with form values', async () => {
    const { mockLogin } = setupAuth();
    renderForm();

    act(() => {
      props.setEmailValue('user@example.com');
      props.setPasswordValue('pass');
    });

    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'pass',
      rememberMe: false,
    });
  });

  it('validates email format', async () => {
    setupAuth();
    renderForm();

    act(() => {
      props.setEmailValue('bad');
      props.setPasswordValue('pass');
    });

    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });

    expect(props.errors.email).toBeDefined();
  });
});
