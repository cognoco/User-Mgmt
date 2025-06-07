// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { PasswordResetForm } from '@/src/ui/headless/auth/PasswordResetForm'149;
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: vi.fn()
}));

function setupAuth(overrides: Record<string, any> = {}) {
  const mockResetPassword = vi.fn().mockResolvedValue({ success: true });
  (useAuth as any).mockReturnValue({
    resetPassword: mockResetPassword,
    isLoading: false,
    error: null,
    successMessage: null,
    ...overrides,
  });
  return { mockResetPassword };
}

describe('PasswordResetForm', () => {
  let props: any;
  const renderForm = (p = {}) =>
    render(
      <PasswordResetForm
        {...p}
        render={(rp) => {
          props = rp;
          return <div />;
        }}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits email and calls resetPassword', async () => {
    const { mockResetPassword } = setupAuth();
    renderForm();
    act(() => {
      props.setEmailValue('user@example.com');
    });
    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });
    expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
    expect(props.isSuccess).toBe(true);
  });

  it('validates email before submitting', async () => {
    const { mockResetPassword } = setupAuth();
    renderForm();
    act(() => {
      props.setEmailValue('bad');
    });
    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(props.errors.email).toBeDefined();
  });

  it('uses external state props', () => {
    setupAuth();
    renderForm({ error: 'e', successMessage: 'ok', isLoading: true });
    expect(props.errors.form).toBe('e');
    expect(props.successMessage).toBe('ok');
    expect(props.isSubmitting).toBe(true);
  });
});
