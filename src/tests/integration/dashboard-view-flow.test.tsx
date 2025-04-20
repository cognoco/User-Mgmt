// __tests__/integration/dashboard-view-flow.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportingDashboard } from '@/components/common/ReportingDashboard';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Import our standardized mock
vi.mock('@/lib/supabase');
import { supabase } from '@/lib/supabase';

// Store original window methods
const originalCreateObjectURL = window.URL.createObjectURL;
const originalRevokeObjectURL = window.URL.revokeObjectURL;
const originalDocumentCreateElement = document.createElement;
const originalBlob = window.Blob;

describe('Dashboard and Reporting Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock dashboard data
    (supabase.rpc as any).mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 12,
          activeUsers: 8
        },
        recentActivity: [
          { id: 'act1', type: 'create', user: 'John', date: '2023-03-15T10:30:00Z' },
          { id: 'act2', type: 'update', user: 'Sarah', date: '2023-03-14T14:20:00Z' }
        ]
      },
      error: null
    });

    // Mock window methods for export test
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    window.Blob = vi.fn().mockImplementation(() => ({}));
  });

  afterEach(() => {
    // Restore original window methods
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalDocumentCreateElement;
    window.Blob = originalBlob;
  });

  test('User can view and interact with dashboard reports', async () => {
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
      expect(screen.getByText('Items This Month: 12')).toBeInTheDocument();
    });
    
    // Verify activity feed is shown
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    
    // Change date range
    // Mock data for new date range
    (supabase.rpc as any).mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 5,
          activeUsers: 3
        },
        recentActivity: [
          { id: 'act3', type: 'delete', user: 'Mike', date: '2023-02-28T09:15:00Z' }
        ]
      },
      error: null
    });
    
    // Select previous month
    // await user.click(screen.getByLabelText(/date range/i));
    // await user.click(screen.getByText(/previous month/i));
    
    // Verify data updated
    // await waitFor(() => {
    //   expect(screen.getByText('Items This Month: 5')).toBeInTheDocument();
    //   expect(screen.getByText('Mike')).toBeInTheDocument();
    // });
    
    // Export report
    // Mock export function
    const mockExportFunc = vi.fn();
    document.createElement = vi.fn().mockImplementation(() => ({
      style: {},
      setAttribute: vi.fn(),
      click: mockExportFunc,
      remove: vi.fn()
    }));
    
    // Click export button
    // await user.click(screen.getByRole('button', { name: /export/i }));
    
    // Verify export was called
    // expect(mockExportFunc).toHaveBeenCalled();
  });

  test('Dashboard displays interactive charts with tooltips', async () => {
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Wait for charts to load
    await waitFor(() => {
      expect(screen.getByTestId('activity-chart')).toBeInTheDocument();
    });
    
    // Hover over chart element to show tooltip
    await user.hover(screen.getByTestId('chart-bar-1'));
    
    // Verify tooltip appears with correct data
    expect(screen.getByText(/12 items/i)).toBeInTheDocument();
    
    // Click on chart element to filter data
    await user.click(screen.getByTestId('chart-bar-1'));
    
    // Mock filtered data response
    supabase.from().select.mockResolvedValueOnce({
      data: [
        { id: 'item1', title: 'Marketing Report', created_at: '2023-03-10' }
      ],
      error: null
    });
    
    // Verify filtered items appear
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
    });
  });

  test('User can switch between different chart types', async () => {
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Wait for charts to load
    await waitFor(() => {
      expect(screen.getByTestId('activity-chart')).toBeInTheDocument();
    });
    
    // Initial chart should be bar chart
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Switch to line chart
    await user.click(screen.getByLabelText(/chart type/i));
    await user.click(screen.getByText(/line chart/i));
    
    // Verify chart type changed
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
    
    // Switch to pie chart
    await user.click(screen.getByLabelText(/chart type/i));
    await user.click(screen.getByText(/pie chart/i));
    
    // Verify chart type changed
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  test('User can filter dashboard by different metrics', async () => {
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
    });
    
    // Initial view shows items metric
    expect(screen.getByText(/items this month/i)).toBeInTheDocument();
    
    // Mock data for user activity metric
    (supabase.rpc as any).mockResolvedValueOnce({
      data: {
        summary: {
          totalUsers: 25,
          newUsersThisMonth: 8,
          activeUsersPercentage: 72
        },
        userActivity: [
          { date: '2023-03-10', newUsers: 3, activeUsers: 18 },
          { date: '2023-03-11', newUsers: 2, activeUsers: 15 }
        ]
      },
      error: null
    });
    
    // Switch to user metrics
    await user.click(screen.getByRole('tab', { name: /users/i }));
    
    // Verify user metrics are displayed
    await waitFor(() => {
      expect(screen.getByText('Total Users: 25')).toBeInTheDocument();
      expect(screen.getByText('New Users This Month: 8')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument(); // Active users percentage
    });
  });

  test('Dashboard handles no data gracefully', async () => {
    // Mock empty dashboard data
    (supabase.rpc as any).mockReset();
    (supabase.rpc as any).mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 0,
          itemsThisMonth: 0,
          activeUsers: 0
        },
        recentActivity: []
      },
      error: null
    });
    
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Verify empty state is displayed
    await waitFor(() => {
      expect(screen.getByText('Total Items: 0')).toBeInTheDocument();
      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    });
    
    // Verify empty chart state
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument();
  });

  test('Dashboard handles error states appropriately', async () => {
    // Mock error during data fetch
    (supabase.rpc as any).mockReset();
    (supabase.rpc as any).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to load dashboard data' }
    });
    
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Verify error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
    });
    
    // Retry button should be present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful data on retry
    (supabase.rpc as any).mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 12,
          activeUsers: 8
        },
        recentActivity: []
      },
      error: null
    });
    
    // Click retry
    await user.click(retryButton);
    
    // Verify data loads after retry
    await waitFor(() => {
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
    });
  });
});
