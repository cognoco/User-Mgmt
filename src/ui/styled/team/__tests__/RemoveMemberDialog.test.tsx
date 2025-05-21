import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemoveMemberDialog } from '../RemoveMemberDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock fetch
const mockFetch = vi.fn();
const originalFetch = global.fetch;
global.fetch = mockFetch;

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('RemoveMemberDialog', () => {
  const mockMember = {
    id: 'member-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    member: mockMember,
    teamLicenseId: 'team-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    vi.restoreAllMocks();
  });

  it('renders correctly', async () => {
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type 'remove' here")).toBeInTheDocument();
  });

  it('disables remove button until confirmation text is entered', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    expect(removeButton).toBeDisabled();

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await act(async () => {
      await user.type(input, 'wrong text');
    });
    expect(removeButton).toBeDisabled();

    await act(async () => {
      await user.clear(input);
      await user.type(input, 'remove');
    });
    expect(removeButton).not.toBeDisabled();
  });

  it('shows error when trying to remove with wrong confirmation text', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await act(async () => {
      await user.type(input, 'wrong');
    });

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    expect(removeButton).toBeDisabled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('removes member successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const user = userEvent.setup();
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await act(async () => {
      await user.type(input, 'remove');
    });

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    await act(async () => {
      await user.click(removeButton);
    });

    expect(mockFetch).toHaveBeenCalledWith(`/api/team/members/${mockMember.id}`, {
      method: 'DELETE',
    });

    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles removal error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to remove member' }),
    });

    const user = userEvent.setup();
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await act(async () => {
      await user.type(input, 'remove');
    });

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    await act(async () => {
      await user.click(removeButton);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to remove member');
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <RemoveMemberDialog {...mockProps} />
        </QueryClientProvider>
      );
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await act(async () => {
      await user.click(cancelButton);
    });

    expect(mockProps.onClose).toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});
