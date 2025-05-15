import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Restore the usePermission mock
vi.mock('@/hooks/usePermission', () => ({
  __esModule: true,
  usePermission: vi.fn(),
}));

import { TeamMembersList as TeamMembersListComponent } from '@/components/team/TeamMembersList';
import { usePermission } from '@/hooks/usePermission';

// Explicitly type the component
const TeamMembersList: React.FC = TeamMembersListComponent;

// Mock fetch globally
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

// Mock data
const mockTeamMembers = {
  users: [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
      teamMember: {
        id: 'member1',
        role: 'ADMIN',
        status: 'active',
        joinedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      image: null,
      teamMember: {
        id: 'member2',
        role: 'MEMBER',
        status: 'pending',
        joinedAt: '2024-01-02T00:00:00Z',
      },
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  seatUsage: {
    used: 2,
    total: 5,
    percentage: 40,
  },
};

// Mock Skeleton component for test selection
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Simple render function without act wrapper for React 19
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('TeamMembersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: false,
      isLoading: false,
    });
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    renderWithProviders(<TeamMembersList />);

    expect(screen.getAllByRole('row')[0]).toHaveTextContent('Member');
    expect(screen.getAllByRole('row')[0]).toHaveTextContent('Role');
    expect(screen.getAllByRole('row')[0]).toHaveTextContent('Status');
    expect(screen.getAllByRole('row')[0]).toHaveTextContent('Joined');

    // Check for loading skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders team members data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('shows invite button when user has permission', async () => {
    vi.mocked(usePermission).mockReturnValue({
      hasPermission: true,
      isLoading: false,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    // Setup mock with multiple responses for original and debounced search
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockTeamMembers,
          users: mockTeamMembers.users.filter(user => 
            user.name.toLowerCase().includes('john') || 
            user.email.toLowerCase().includes('john')
          ),
        }),
      });

    // Setup user event for React 19
    const user = userEvent.setup();
    
    renderWithProviders(<TeamMembersList />);

    const searchInput = screen.getByPlaceholderText('Search members...');
    
    // Type in the search input
    await user.type(searchInput, 'john');

    // Wait for the debounced fetch to be called (we need to account for the debounce timer)
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      expect(calls[calls.length - 1][0]).toContain('search=john');
    }, { timeout: 500 }); // Increase timeout for debounce
  });

  // Radix UI Select does not work with JSDOM/Testing Library due to pointer event limitations.
  // This should be covered by E2E tests in a real browser environment.
  it.skip('handles status filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    const user = userEvent.setup();
    renderWithProviders(<TeamMembersList />);

    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    await user.click(screen.getByText('Active'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active')
      );
    });
  });

  it('handles sorting', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    const user = userEvent.setup();
    renderWithProviders(<TeamMembersList />);

    const roleSort = await screen.findByText('Role');
    const roleSortButton = roleSort.closest('button');
    
    await user.click(roleSortButton!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=role')
      );
    });
  });

  it('displays seat usage information', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(screen.getByText('Seat Usage: 2/5')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const mockDataWithPagination = {
      ...mockTeamMembers,
      pagination: {
        ...mockTeamMembers.pagination,
        hasNextPage: true,
        totalPages: 2,
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDataWithPagination),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDataWithPagination),
      });

    const user = userEvent.setup();
    renderWithProviders(<TeamMembersList />);

    // Wait for the pagination controls to appear
    const nextButton = await screen.findByLabelText('Next page');
    
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('handles errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error loading team members'
      );
    });
  });
});
