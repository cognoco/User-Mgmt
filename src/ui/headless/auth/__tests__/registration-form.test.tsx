// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { RegistrationForm } from '../RegistrationForm';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: vi.fn()
}));

function setupAuth(overrides: Record<string, any> = {}) {
  const mockRegister = vi.fn().mockResolvedValue({ success: true });
  (useAuth as any).mockReturnValue({
    register: mockRegister,
    isLoading: false,
    error: null,
    successMessage: null,
    ...overrides,
  });
  return { mockRegister };
}

describe('RegistrationForm (headless)', () => {
  let props: any;
  const renderForm = (p = {}) =>
    render(
      <RegistrationForm
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

  it('calls register with form values', async () => {
    const { mockRegister } = setupAuth();
    renderForm();
    act(() => {
      props.setEmailValue('user@example.com');
      props.setPasswordValue('Password123');
      props.setConfirmPasswordValue('Password123');
      props.setFirstNameValue('A');
      props.setLastNameValue('B');
      props.setAcceptTermsValue(true);
    });
    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });
    expect(mockRegister).toHaveBeenCalled();
  });
});
