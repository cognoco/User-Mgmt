import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProfileVerification from '../ProfileVerification';
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
  it('shows unverified status and request button', () => {
    render(<ProfileVerification />);
    expect(screen.getByText(/not verified/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
  });

  it('shows pending status and disables request', () => {
    setMockStore({ verification: { status: 'pending' } });
    render(<ProfileVerification />);
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /request verification/i })).not.toBeInTheDocument();
  });

  it('shows verified status', () => {
    setMockStore({ verification: { status: 'verified' } });
    render(<ProfileVerification />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
    expect(screen.getByText(/your profile is verified/i)).toBeInTheDocument();
  });

  it('shows rejected status and admin feedback', () => {
    setMockStore({ verification: { status: 'rejected', admin_feedback: 'Blurry document' } });
    render(<ProfileVerification />);
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByText(/blurry document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
  });

  it('shows document upload field when enabled', () => {
    render(<ProfileVerification enableDocumentUpload />);
    expect(screen.getByLabelText(/upload supporting document/i)).toBeInTheDocument();
  });

  it('does not show document upload field when disabled', () => {
    render(<ProfileVerification enableDocumentUpload={false} />);
    expect(screen.queryByLabelText(/upload supporting document/i)).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    setMockStore({ verificationLoading: true });
    render(<ProfileVerification />);
    expect(screen.getByText(/loading verification status/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    setMockStore({ verificationError: 'Something went wrong' });
    render(<ProfileVerification />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('calls requestVerification when button is clicked', async () => {
    const requestVerification = vi.fn();
    setMockStore({ requestVerification });
    render(<ProfileVerification />);
    const button = screen.getByRole('button', { name: /request verification/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(requestVerification).toHaveBeenCalled();
    });
  });
});
