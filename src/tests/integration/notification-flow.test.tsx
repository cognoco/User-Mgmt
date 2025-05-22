// __tests__/integration/notification-flow.test.tsx

vi.mock('@/lib/database/supabase', () => require('../mocks/supabase'));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPreferences } from '@/ui/styled/shared/NotificationPreferences';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Import our standardized mock
import { supabase } from '@/adapters/database/supabase-provider';
import { NotificationCenter } from '@/ui/styled/common/NotificationCenter';

describe('Notification Management Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock current notification settings
    (supabase.from as any)('notification_settings').select.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: false,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: false
        }
      },
      error: null
    });
  });

  test('User can view and update notification preferences', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
      expect(screen.getByLabelText(/push notifications/i)).not.toBeChecked();
    });
    
    // Verify notification types are displayed correctly
    expect(screen.getByLabelText(/system updates/i)).toBeChecked();
    expect(screen.getByLabelText(/new messages/i)).toBeChecked();
    expect(screen.getByLabelText(/activity summaries/i)).not.toBeChecked();
    
    // Update settings
    await user.click(screen.getByLabelText(/push notifications/i));
    await user.click(screen.getByLabelText(/activity summaries/i));
    
    // Mock successful update
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: true
        }
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify save was successful
    await waitFor(() => {
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
    });
    
    // Verify update was called with correct data
    expect((supabase.from as any)('notification_settings').update).toHaveBeenCalledWith({
      push_notifications: true,
      notification_types: {
        system_updates: true,
        new_messages: true,
        activity_summaries: true
      }
    });
  });
  
  test('displays error when settings cannot be loaded', async () => {
    // Mock error loading settings
    (supabase.from as any)('notification_settings').select.mockReset();
    (supabase.from as any)('notification_settings').select.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error loading notification settings' }
    });
    
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading notification settings/i)).toBeInTheDocument();
    });
    
    // Retry button should be visible
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
  
  test('handles error when saving settings', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Make a change
    await user.click(screen.getByLabelText(/push notifications/i));
    
    // Mock error during update
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error saving notification settings' }
    });
    
    // Try to save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error saving notification settings/i)).toBeInTheDocument();
    });
  });
  
  test('can reset notification preferences to defaults', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
    });
    
    // Mock successful reset
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: true,
          mentions: true
        }
      },
      error: null
    });
    
    // Click reset to defaults button
    await user.click(screen.getByRole('button', { name: /reset to defaults/i }));
    
    // Confirm reset
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify reset was successful
    await waitFor(() => {
      expect(screen.getByText(/settings restored/i)).toBeInTheDocument();
    });
    
    // Verify defaults were applied
    expect(screen.getByLabelText(/push notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/activity summaries/i)).toBeChecked();
  });
  
  test('can toggle individual notification channels', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Expand notification channels section
    await user.click(screen.getByRole('button', { name: /notification channels/i }));
    
    // Verify channel options are displayed
    expect(screen.getByLabelText(/email/i)).toBeChecked();
    expect(screen.getByLabelText(/in-app/i)).toBeChecked();
    expect(screen.getByLabelText(/mobile/i)).not.toBeChecked();
    
    // Toggle mobile notifications on
    await user.click(screen.getByLabelText(/mobile/i));
    
    // Mock successful update
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: {
        channels: {
          email: true,
          in_app: true,
          mobile: true
        }
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify update was called with correct data
    expect((supabase.from as any)('notification_settings').update).toHaveBeenCalledWith(expect.objectContaining({
      channels: {
        email: true,
        in_app: true,
        mobile: true
      }
    }));
  });
  
  test('supports frequency settings for different notification types', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Expand frequency settings
    await user.click(screen.getByRole('button', { name: /notification frequency/i }));
    
    // Verify frequency options are displayed
    expect(screen.getByLabelText(/system updates frequency/i)).toHaveValue('immediate');
    expect(screen.getByLabelText(/activity summaries frequency/i)).toHaveValue('daily');
    
    // Change frequency for activity summaries
    await user.selectOptions(
      screen.getByLabelText(/activity summaries frequency/i),
      'weekly'
    );
    
    // Mock successful update
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: {
        frequency: {
          system_updates: 'immediate',
          activity_summaries: 'weekly'
        }
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify update was called with correct data
    expect((supabase.from as any)('notification_settings').update).toHaveBeenCalledWith(expect.objectContaining({
      frequency: {
        system_updates: 'immediate',
        activity_summaries: 'weekly'
      }
    }));
  });
  
  test('supports quiet hours configuration', async () => {
    // Render notification settings
    render(<NotificationPreferences />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Enable quiet hours
    await user.click(screen.getByLabelText(/enable quiet hours/i));
    
    // Verify quiet hours inputs appear
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    
    // Set quiet hours
    await user.clear(screen.getByLabelText(/start time/i));
    await user.type(screen.getByLabelText(/start time/i), '22:00');
    
    await user.clear(screen.getByLabelText(/end time/i));
    await user.type(screen.getByLabelText(/end time/i), '07:00');
    
    // Mock successful update
    (supabase.from as any)('notification_settings').update.mockResolvedValueOnce({
      data: {
        quiet_hours: {
          enabled: true,
          start_time: '22:00',
          end_time: '07:00'
        }
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify update was called with correct data
    expect((supabase.from as any)('notification_settings').update).toHaveBeenCalledWith(expect.objectContaining({
      quiet_hours: {
        enabled: true,
        start_time: '22:00',
        end_time: '07:00'
      }
    }));
  });

  test('Admin receives and views SSO event notification end-to-end', async () => {
    // Mock SSO event notification in company_notification_logs
    (supabase.from as any)('company_notification_logs').select.mockResolvedValueOnce({
      data: [
        {
          id: 'notif-sso-1',
          recipient_id: 'user-123',
          notification_type: 'sso_event',
          channel: 'in_app',
          content: { subject: 'SSO Configuration Updated', content: 'The SSO configuration for your organization has been updated.' },
          is_read: false,
          created_at: new Date().toISOString(),
        }
      ],
      error: null
    });
    // Mock user context
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'admin@example.com' } },
      error: null
    });
    // Render NotificationCenter
    render(<NotificationCenter />);
    // Wait for SSO notification to appear
    await waitFor(() => {
      expect(screen.getByText('SSO Configuration Updated')).toBeInTheDocument();
    });
    // Switch to SSO Events tab
    await userEvent.click(screen.getByRole('tab', { name: /SSO Events/i }));
    // Assert SSO notification is visible in SSO tab
    expect(screen.getByText('SSO Configuration Updated')).toBeInTheDocument();
    expect(screen.getByText('The SSO configuration for your organization has been updated.')).toBeInTheDocument();
    // Mark as read
    await userEvent.click(screen.getByRole('button', { name: /Mark as read/i }));
    // Notification should now be marked as read (opacity or other UI change)
    await waitFor(() => {
      expect(screen.getByText('SSO Configuration Updated').closest('div')).toHaveClass('opacity-60');
    });
  });
});
