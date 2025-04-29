import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamManagement } from '../TeamManagement';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { vi } from 'vitest';

const adminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
};
const memberUser = {
  id: '2',
  name: 'Member User',
  email: 'member@example.com',
};
const viewerUser = {
  id: '3',
  name: 'Viewer User',
  email: 'viewer@example.com',
};

const teamLicense = {
  totalSeats: 5,
  usedSeats: 3,
  members: [
    { id: '1', user: adminUser, role: 'admin', status: 'active' },
    { id: '2', user: memberUser, role: 'member', status: 'active' },
    { id: '3', user: viewerUser, role: 'member', status: 'pending' },
  ],
};

let currentTotalSeats = 5;

const server = setupServer(
  http.get('/api/subscriptions/team/license', () => {
    return HttpResponse.json({ ...teamLicense, totalSeats: currentTotalSeats });
  }),
  http.put('/api/subscriptions/team/seats', async ({ request }) => {
    const body = await request.json();
    if (body && typeof body === 'object' && 'seats' in body) {
      currentTotalSeats = body.seats;
    }
    return HttpResponse.json({ ...teamLicense, totalSeats: currentTotalSeats });
  }),
  http.delete('/api/subscriptions/team/members/:memberId', ({ params }) => {
    const { memberId } = params;
    if (memberId === '1') {
      return HttpResponse.json({ message: 'Cannot remove yourself' }, { status: 400 });
    }
    return new HttpResponse(null, { status: 200 });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  currentTotalSeats = 5;
});
afterAll(() => server.close());

// Mock toast from sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

async function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  let result;
  await act(async () => {
    result = render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  });
  return result;
}

describe('TeamManagement (integration)', () => {
  it('renders team members and seat info', async () => {
    await renderWithClient(<TeamManagement />);
    expect(screen.getByText(/Loading team information/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Member User')).toBeInTheDocument();
      expect(screen.getByText('Viewer User')).toBeInTheDocument();
      expect(screen.getByText(/Seats Used: 3 of 5/)).toBeInTheDocument();
    });
  });

  it('allows admin to update seat count', async () => {
    await renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Update Seats'));
    const user = userEvent.setup();
    const [openDialogButton] = screen.getAllByText('Update Seats');
    await act(async () => {
      await user.click(openDialogButton);
    });
    const input = screen.getByLabelText(/Number of Seats/i);
    await act(async () => {
      await user.clear(input);
      await user.type(input, '6');
    });
    const updateButtons = screen.getAllByText('Update Seats');
    const dialogButton = updateButtons[1];
    await act(async () => {
      await user.click(dialogButton);
    });
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          /Seats Used:\s*3\s*of\s*6/.test(content)
        )
      ).toBeInTheDocument();
    });
  });

  it('shows error if trying to remove self', async () => {
    await renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Admin User'));
    const removeButtons = screen.getAllByText('Remove');
    const user = userEvent.setup();
    await act(async () => {
      await user.click(removeButtons[0]); // Try to remove self (admin)
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/Failed to remove member/i));
    });
  });

  it('allows admin to remove another member', async () => {
    await renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Member User'));
    const removeButtons = screen.getAllByText('Remove');
    const user = userEvent.setup();
    await act(async () => {
      await user.click(removeButtons[1]); // Remove member
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Successfully removed team member/i));
    });
  });

  it('shows warning when seats are low', async () => {
    await renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText(/Running Low on Seats/i));
    expect(screen.getByText(/You have 2 seats remaining/i)).toBeInTheDocument();
  });

  // Add more tests for role-based UI/permission if UI is updated to hide actions for non-admins
});
