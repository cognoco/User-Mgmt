import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemoveMemberDialog } from '../RemoveMemberDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock fetch
const mockFetch = vi.fn();
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
  });

  it('renders correctly', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Remove Team Member')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type 'remove' here")).toBeInTheDocument();
  });

  it('disables remove button until confirmation text is entered', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    expect(removeButton).toBeDisabled();

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await user.type(input, 'wrong text');
    expect(removeButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'remove');
    expect(removeButton).not.toBeDisabled();
  });

  it('shows error when trying to remove with wrong confirmation text', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await user.type(input, 'wrong');

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    await user.click(removeButton);

    expect(screen.getByText('Please type "remove" to confirm')).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('removes member successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const user = userEvent.setup();
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await user.type(input, 'remove');

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    await user.click(removeButton);

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
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText("Type 'remove' here");
    await user.type(input, 'remove');

    const removeButton = screen.getByRole('button', { name: /Remove Member/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to remove member')).toBeInTheDocument();
    });
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RemoveMemberDialog {...mockProps} />
      </QueryClientProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
