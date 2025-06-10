import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProfileVerification from '@/ui/styled/profile/ProfileVerification';
import { useProfileStore } from '@/lib/stores/profile.store';

vi.mock('@/lib/stores/profile.store');

const mockStore = {
  verification: { status: 'unverified' },
  verificationLoading: false,
  verificationError: null,
  fetchVerificationStatus: vi.fn(),
  requestVerification: vi.fn(),
};

const setMockStore = (overrides = {}) => {
  (useProfileStore as any).mockImplementation(() => ({
    ...mockStore,
    ...overrides,
  }));
};

beforeEach(() => {
  vi.clearAllMocks();
  setMockStore();
});

describe('ProfileVerification', () => {
  it('shows unverified status and request button', async () => {
    await act(async () => {
      render(<ProfileVerification />);
    });
    expect(screen.getByText(/not verified/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
  });

  it('shows pending status and disables request', async () => {
    setMockStore({ verification: { status: 'pending' } });
    await act(async () => {
      render(<ProfileVerification />);
    });
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /request verification/i })).not.toBeInTheDocument();
  });

  it('shows verified status', async () => {
    setMockStore({ verification: { status: 'verified' } });
    await act(async () => {
      render(<ProfileVerification />);
    });
    const verifiedElements = screen.getAllByText(/verified/i);
    expect(verifiedElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/your profile is verified/i)).toBeInTheDocument();
  });

  it('shows rejected status and admin feedback', async () => {
    setMockStore({ verification: { status: 'rejected', admin_feedback: 'Blurry document' } });
    await act(async () => {
      render(<ProfileVerification />);
    });
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByText(/blurry document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
  });

  it('shows document upload field when enabled', async () => {
    await act(async () => {
      render(<ProfileVerification enableDocumentUpload />);
    });
    expect(screen.getByLabelText(/upload supporting document/i)).toBeInTheDocument();
  });

  it('does not show document upload field when disabled', async () => {
    await act(async () => {
      render(<ProfileVerification enableDocumentUpload={false} />);
    });
    expect(screen.queryByLabelText(/upload supporting document/i)).not.toBeInTheDocument();
  });

  it('shows loading state', async () => {
    setMockStore({ verificationLoading: true });
    await act(async () => {
      render(<ProfileVerification />);
    });
    expect(screen.getByText(/loading verification status/i)).toBeInTheDocument();
  });

  it('shows error state', async () => {
    setMockStore({ verificationError: 'Something went wrong' });
    await act(async () => {
      render(<ProfileVerification />);
    });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('calls requestVerification when button is clicked', async () => {
    const requestVerification = vi.fn();
    setMockStore({ requestVerification });
    await act(async () => {
      render(<ProfileVerification />);
    });
    const button = screen.getByRole('button', { name: /request verification/i });
    await userEvent.click(button);
    await waitFor(() => {
      expect(requestVerification).toHaveBeenCalled();
    });
  });
});
