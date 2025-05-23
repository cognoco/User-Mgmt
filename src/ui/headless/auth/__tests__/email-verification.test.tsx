// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { EmailVerification } from '../EmailVerification';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: vi.fn()
}));

function setupStore(overrides: Record<string, any> = {}) {
  const store = {
    verifyEmail: vi.fn().mockResolvedValue(undefined),
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
    successMessage: null,
    clearError: vi.fn(),
    clearSuccessMessage: vi.fn(),
    ...overrides,
  };
  (useAuth as any).mockImplementation(() => store);
  return store;
}

describe('EmailVerification', () => {
  let props: any;
  const renderComponent = () =>
    render(
      <EmailVerification
        render={(p) => {
          props = p;
          return <div />;
        }}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes initial state to render', () => {
    setupStore();
    renderComponent();
    expect(props.error).toBeNull();
    expect(props.successMessage).toBeNull();
    expect(props.isLoading).toBe(false);
  });

  it('calls verifyEmail on handleVerify', async () => {
    const store = setupStore();
    renderComponent();
    act(() => {
      props.setToken('abc');
    });
    await act(async () => {
      await props.handleVerify({ preventDefault() {} } as any);
    });
    expect(store.verifyEmail).toHaveBeenCalledWith('abc');
    expect(store.clearError).toHaveBeenCalled();
    expect(store.clearSuccessMessage).toHaveBeenCalled();
  });

  it('calls sendVerificationEmail on handleResend', async () => {
    const store = setupStore();
    renderComponent();
    act(() => {
      props.setEmail('test@example.com');
    });
    await act(async () => {
      await props.handleResend({ preventDefault() {} } as any);
    });
    expect(store.sendVerificationEmail).toHaveBeenCalledWith('test@example.com');
  });
});
