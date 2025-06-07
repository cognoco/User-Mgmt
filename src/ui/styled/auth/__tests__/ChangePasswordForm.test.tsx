import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChangePasswordForm } from '@/src/ui/styled/auth/ChangePasswordForm'176;

let formState: any;

vi.mock('../../../headless/auth/ChangePasswordForm', () => ({
  ChangePasswordForm: ({ children }: any) => children(formState)
}));

describe('ChangePasswordForm styled component', () => {
  beforeEach(() => {
    formState = {
      handleSubmit: vi.fn((e: any) => e.preventDefault()),
      currentPasswordValue: '',
      setCurrentPasswordValue: vi.fn(),
      newPasswordValue: '',
      setNewPasswordValue: vi.fn(),
      confirmPasswordValue: '',
      setConfirmPasswordValue: vi.fn(),
      isSubmitting: false,
      isValid: true,
      errors: {},
      touched: { currentPassword: false, newPassword: false, confirmPassword: false },
      handleBlur: vi.fn(),
      successMessage: null
    };
  });

  it('submits the form via headless handler', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await user.type(screen.getByLabelText('Current Password'), 'old');
    await user.type(screen.getByLabelText('New Password'), 'newpass1A');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpass1A');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));
    expect(formState.handleSubmit).toHaveBeenCalled();
  });

  it('shows success alert when provided', () => {
    formState.successMessage = 'done';
    render(<ChangePasswordForm />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('done')).toBeInTheDocument();
  });
});
