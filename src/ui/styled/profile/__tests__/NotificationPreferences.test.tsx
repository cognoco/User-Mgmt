import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationPreferences from '@/src/ui/styled/profile/NotificationPreferences'154;

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NotificationPreferences', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders and loads preferences', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notifications: { email: true, push: false, marketing: true } })
    });
    await act(async () => {
      render(<NotificationPreferences />);
    });
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Email Notifications')).toBeChecked();
      expect(screen.getByLabelText('Push Notifications')).not.toBeChecked();
      expect(screen.getByLabelText('Product & Marketing Updates')).toBeChecked();
    });
  });

  it('shows loading state', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      render(<NotificationPreferences />);
    });
    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Error' });
    await act(async () => {
      render(<NotificationPreferences />);
    });
    await waitFor(() => {
      expect(screen.getByText('Failed to load notification preferences.')).toBeInTheDocument();
    });
  });

  it('can update and save preferences', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: { email: true, push: false, marketing: false } }) }) // GET
      .mockResolvedValueOnce({ ok: true }); // PUT
    await act(async () => {
      render(<NotificationPreferences />);
    });
    await waitFor(() => expect(screen.getByLabelText('Email Notifications')).toBeChecked());
    await userEvent.click(screen.getByLabelText('Push Notifications'));
    await userEvent.click(screen.getByText('Save Preferences'));
    await waitFor(() => {
      expect(screen.getByText('Notification preferences saved successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on save failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: { email: true, push: false, marketing: false } }) }) // GET
      .mockResolvedValueOnce({ ok: false, text: async () => 'Error' }); // PUT
    await act(async () => {
      render(<NotificationPreferences />);
    });
    await waitFor(() => expect(screen.getByLabelText('Email Notifications')).toBeChecked());
    await userEvent.click(screen.getByText('Save Preferences'));
    await waitFor(() => {
      expect(screen.getByText('Failed to save notification preferences.')).toBeInTheDocument();
    });
  });
});
