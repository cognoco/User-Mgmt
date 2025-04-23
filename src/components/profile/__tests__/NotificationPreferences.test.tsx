import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferences from '../NotificationPreferences';

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
    render(<NotificationPreferences />);
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Email Notifications')).toBeChecked();
      expect(screen.getByLabelText('Push Notifications')).not.toBeChecked();
      expect(screen.getByLabelText('Product & Marketing Updates')).toBeChecked();
    });
  });

  it('shows loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<NotificationPreferences />);
    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Error' });
    render(<NotificationPreferences />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load notification preferences.')).toBeInTheDocument();
    });
  });

  it('can update and save preferences', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: { email: true, push: false, marketing: false } }) }) // GET
      .mockResolvedValueOnce({ ok: true }); // PUT
    render(<NotificationPreferences />);
    await waitFor(() => expect(screen.getByLabelText('Email Notifications')).toBeChecked());
    fireEvent.click(screen.getByLabelText('Push Notifications'));
    fireEvent.click(screen.getByText('Save Preferences'));
    await waitFor(() => {
      expect(screen.getByText('Notification preferences saved successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on save failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notifications: { email: true, push: false, marketing: false } }) }) // GET
      .mockResolvedValueOnce({ ok: false, text: async () => 'Error' }); // PUT
    render(<NotificationPreferences />);
    await waitFor(() => expect(screen.getByLabelText('Email Notifications')).toBeChecked());
    fireEvent.click(screen.getByText('Save Preferences'));
    await waitFor(() => {
      expect(screen.getByText('Failed to save notification preferences.')).toBeInTheDocument();
    });
  });
});
