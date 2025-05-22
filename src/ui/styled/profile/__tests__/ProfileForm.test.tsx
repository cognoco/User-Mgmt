import React from 'react';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileForm } from '../ProfileForm';
import { createMockProfileStore } from '@/tests/mocks/profile.store.mock';

let store: any;
let updateProfileMock: any;

vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: () => store,
}));
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ user: { email: 'user@example.com' } }),
}));
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

describe('ProfileForm component', () => {
  beforeEach(() => {
    updateProfileMock = vi.fn();
    store = createMockProfileStore(
      {
        profile: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          bio: 'Old bio',
          phone_number: '123',
          address: '123 St',
          city: 'City',
          state: 'State',
          country: 'Country',
          postal_code: '12345',
          website: 'https://example.com',
          is_public: true,
        },
        isLoading: false,
        error: null,
      },
      { updateProfile: updateProfileMock, fetchProfile: vi.fn() }
    );
  });

  it('toggles edit mode and submits updates', async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    await user.clear(screen.getByLabelText('Bio'));
    await user.type(screen.getByLabelText('Bio'), 'New bio');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalled();
    });
  });

  it('displays the current user\'s email from the auth hook', () => {
    render(<ProfileForm />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});
