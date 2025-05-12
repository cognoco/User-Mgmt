import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../AdminDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react-dom/test-utils';
import { rest } from 'msw';
const server = (globalThis as any).server;

// Mock data
const dashboardUrl = '/api/admin/dashboard';

const mockDashboardData = {
  team: {
    activeMembers: 8,
    pendingMembers: 2,
    totalMembers: 10,
    seatUsage: {
      used: 10,
      total: 15,
      percentage: 66.67,
    },
  },
  subscription: {
    plan: 'business',
    status: 'active',
    trialEndsAt: null,
    currentPeriodEndsAt: '2024-12-31T23:59:59Z',
  },
  recentActivity: [
    {
      id: '1',
      type: 'member_invited',
      description: 'Invited new team member',
      createdAt: '2024-03-20T10:00:00Z',
      user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  ],
};

// Setup QueryClient for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for providing query client
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function setupDashboardHandler(response: any, status = 200) {
  server.use(
    rest.get(dashboardUrl, (req: any, res: any, ctx: any) => {
      if (status >= 400) {
        return res(ctx.status(status));
      }
      return res(ctx.status(status), ctx.json(response));
    })
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    queryClient.clear();
    server.resetHandlers();
  });

  it('renders loading state initially', async () => {
    // Simulate loading by delaying the response
    server.use(
      rest.get(dashboardUrl, (req: any, res: any, ctx: any) => {
        return res(ctx.delay(100), ctx.json(mockDashboardData));
      })
    );
    await act(async () => {
      render(<AdminDashboard />, { wrapper });
    });
    expect(screen.getByText('Team Overview')).toBeInTheDocument();
    expect(screen.getByText('Subscription Status')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders dashboard data successfully', async () => {
    setupDashboardHandler(mockDashboardData);
    await act(async () => {
      render(<AdminDashboard />, { wrapper });
    });
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('10/15')).toBeInTheDocument();
    });
    expect(screen.getByText('business')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Invited new team member')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    setupDashboardHandler({}, 500);
    await act(async () => {
      render(<AdminDashboard />, { wrapper });
    });
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays empty state for no recent activity', async () => {
    const noActivityData = {
      ...mockDashboardData,
      recentActivity: [],
    };
    setupDashboardHandler(noActivityData);
    await act(async () => {
      render(<AdminDashboard />, { wrapper });
    });
    await waitFor(() => {
      expect(screen.getByText('No recent activity to display')).toBeInTheDocument();
    });
  });

  it('refreshes data periodically', async () => {
    let callCount = 0;
    server.use(
      rest.get(dashboardUrl, (req: any, res: any, ctx: any) => {
        callCount++;
        if (callCount === 1) {
          return res(ctx.json(mockDashboardData));
        }
        return res(
          ctx.json({
            ...mockDashboardData,
            team: { ...mockDashboardData.team, activeMembers: 9 },
          })
        );
      })
    );
    await act(async () => {
      render(<AdminDashboard />, { wrapper });
    });
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });
    await waitFor(
      () => {
        expect(screen.getByText('9')).toBeInTheDocument();
      },
      { timeout: 31000 }
    );
  });
});
