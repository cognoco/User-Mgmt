import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamManagement } from '../TeamManagement';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

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
  rest.get('/api/subscriptions/team/license', (req, res, ctx) => {
    return res(ctx.json(teamLicense));
  }),
  rest.put('/api/subscriptions/team/seats', (req, res, ctx) => {
    return res(ctx.json({ ...teamLicense, totalSeats: 6 }));
  }),
  rest.delete('/api/subscriptions/team/members/:memberId', (req, res, ctx) => {
    const { memberId } = req.params;
    if (memberId === '1') {
      return res(ctx.status(400), ctx.json({ message: 'Cannot remove yourself' }));
    }
    return res(ctx.status(200));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('TeamManagement (integration)', () => {
  it('renders team members and seat info', async () => {
    renderWithClient(<TeamManagement />);
    expect(screen.getByText(/Loading team information/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Member User')).toBeInTheDocument();
      expect(screen.getByText('Viewer User')).toBeInTheDocument();
      expect(screen.getByText(/Seats Used: 3 of 5/)).toBeInTheDocument();
    });
  });

  it('allows admin to update seat count', async () => {
    renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Update Seats'));
    fireEvent.click(screen.getByText('Update Seats'));
    const input = screen.getByLabelText(/Number of Seats/i);
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByText('Update Seats', { selector: 'button' }));
    await waitFor(() => {
      expect(screen.getByText(/Seats Used: 3 of 6/)).toBeInTheDocument();
    });
  });

  it('shows error if trying to remove self', async () => {
    renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Admin User'));
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]); // Try to remove self (admin)
    await waitFor(() => {
      expect(screen.getByText(/Failed to remove member/i)).toBeInTheDocument();
    });
  });

  it('allows admin to remove another member', async () => {
    renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText('Member User'));
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[1]); // Remove member
    await waitFor(() => {
      expect(screen.getByText(/Successfully removed team member/i)).toBeInTheDocument();
    });
  });

  it('shows warning when seats are low', async () => {
    renderWithClient(<TeamManagement />);
    await waitFor(() => screen.getByText(/Running Low on Seats/i));
    expect(screen.getByText(/You have 2 seats remaining/i)).toBeInTheDocument();
  });

  // Add more tests for role-based UI/permission if UI is updated to hide actions for non-admins
});
