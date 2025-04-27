import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamManagement } from '../TeamManagement';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';

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

const server = setupServer(
  http.get('/api/subscriptions/team/license', () => {
    return HttpResponse.json(teamLicense);
  }),
  http.put('/api/subscriptions/team/seats', () => {
    return HttpResponse.json({ ...teamLicense, totalSeats: 6 });
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
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
    await act(async () => {
      await user.click(screen.getByText('Update Seats'));
    });
    const input = screen.getByLabelText(/Number of Seats/i);
    await act(async () => {
      await user.clear(input);
      await user.type(input, '6');
    });
    await act(async () => {
      await user.click(screen.getByText('Update Seats', { selector: 'button' }));
    });
    await waitFor(() => {
      expect(screen.getByText(/Seats Used: 3 of 6/)).toBeInTheDocument();
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
      expect(screen.getByText(/Failed to remove member/i)).toBeInTheDocument();
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
      expect(screen.getByText(/Successfully removed team member/i)).toBeInTheDocument();
    });
  });

  it('shows warning when seats are low', async () => {
    await renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText(/Running Low on Seats/i));
    expect(screen.getByText(/You have 2 seats remaining/i)).toBeInTheDocument();
  });

  // Add more tests for role-based UI/permission if UI is updated to hide actions for non-admins
});
