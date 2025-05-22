import React from 'react';
import { render, screen } from '@/tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { AccountDeletion } from '../AccountDeletion';

// Mock the auth hook - this is what we're testing
const deleteAccountMock = vi.fn();
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    deleteAccount: deleteAccountMock,
    isLoading: false,
    error: null,
  }),
}));

// Mock the toast component
vi.mock('@/ui/primitives/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('AccountDeletion component', () => {
  it('renders with auth hook data', () => {
    render(<AccountDeletion />);
    
    // Verify the component renders with the delete button
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
