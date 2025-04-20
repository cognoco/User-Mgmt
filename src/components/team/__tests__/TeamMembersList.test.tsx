import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { usePermission } from '@/lib/hooks/usePermission';

// Mock the usePermission hook
vi.mock('@/lib/hooks/usePermission', () => ({
  usePermission: vi.fn(),
}));

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
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
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
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    renderWithProviders(<TeamMembersList />);

    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=john')
      );
    });
  });

  it('handles status filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTeamMembers),
    });

    renderWithProviders(<TeamMembersList />);

    const statusSelect = screen.getByRole('combobox');
    fireEvent.click(statusSelect);
    fireEvent.click(screen.getByText('Active'));

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

    renderWithProviders(<TeamMembersList />);

    const roleSort = screen.getByText('Role').closest('button');
    fireEvent.click(roleSort!);

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

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('displays error state', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<TeamMembersList />);

    await waitFor(() => {
      expect(
        screen.getByText('Error loading team members. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
