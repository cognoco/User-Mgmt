import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../AdminDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock data
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

// Mock fetch function
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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

describe('AdminDashboard', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(() => {})
    );

    render(<AdminDashboard />, { wrapper });

    expect(screen.getByText('Team Overview')).toBeInTheDocument();
    expect(screen.getByText('Subscription Status')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();

    // Check for loading skeletons
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders dashboard data successfully', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      })
    );

    render(<AdminDashboard />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total members
      expect(screen.getByText('8')).toBeInTheDocument(); // Active members
      expect(screen.getByText('2')).toBeInTheDocument(); // Pending members
      expect(screen.getByText('10/15')).toBeInTheDocument(); // Seat usage
    });

    // Check subscription info
    expect(screen.getByText('business')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();

    // Check recent activity
    expect(screen.getByText('Invited new team member')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<AdminDashboard />, { wrapper });

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

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(noActivityData),
      })
    );

    render(<AdminDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No recent activity to display')).toBeInTheDocument();
    });
  });

  it('refreshes data periodically', async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockDashboardData,
            team: { ...mockDashboardData.team, activeMembers: 9 },
          }),
        })
      );

    render(<AdminDashboard />, { wrapper });

    // Initial data
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument(); // Initial active members
    });

    // Wait for refetch and check updated data
    await waitFor(
      () => {
        expect(screen.getByText('9')).toBeInTheDocument(); // Updated active members
      },
      { timeout: 31000 } // Slightly longer than refetch interval
    );
  });
});
