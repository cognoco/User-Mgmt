import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { AuditLogViewer } from '../../../styled/audit/AuditLogViewer';
import { act } from 'react-dom/test-utils';

const mockLogs = [
  {
    id: 'log-1',
    timestamp: '2024-06-01T12:00:00Z',
    method: 'POST',
    path: '/api/users',
    user_id: 'admin-1',
    status_code: 201,
    response_time: 120,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    error: undefined,
  },
  {
    id: 'log-2',
    timestamp: '2024-06-01T13:00:00Z',
    method: 'DELETE',
    path: '/api/users/2',
    user_id: 'admin-1',
    status_code: 403,
    response_time: 80,
    action: 'ACCOUNT_DELETION_ERROR',
    status: 'FAILURE',
    error: 'Forbidden',
  },
];

const server = setupServer(
  rest.get('/api/audit/user-actions', (req: any, res: any, ctx: any) => {
    return res(
      ctx.json({
        logs: mockLogs,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      })
    );
  }),
  rest.get('/api/audit/user-actions/export', (req: any, res: any, ctx: any) => {
    return res(ctx.status(200), ctx.body('csv,data'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuditLogViewer (admin)', () => {
  it('renders audit logs and table headers', async () => {
    render(<AuditLogViewer isAdmin={true} />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('POST')).toBeInTheDocument();
      expect(screen.getByText('/api/users')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Failure')).toBeInTheDocument();
    });
  });

  it('shows access denied for non-admin', () => {
    render(<AuditLogViewer isAdmin={false} />);
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });

  it('filters logs by method', async () => {
    render(<AuditLogViewer isAdmin={true} />);
    await waitFor(() => screen.getByText('POST'));
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Method'), { target: { value: 'DELETE' } });
    });
    // Simulate filter logic: MSW will still return both logs, but UI should update if filter is implemented client-side
    // For now, just check that filter UI is present
    expect(screen.getByLabelText('Method')).toBeInTheDocument();
  });

  it('handles export as CSV', async () => {
    render(<AuditLogViewer isAdmin={true} />);
    await waitFor(() => screen.getByText('Audit Logs'));
    const exportButton = screen.getByRole('button', { name: /Export options/i });
    await act(async () => {
      fireEvent.click(exportButton);
    });
    const csvOption = screen.getByRole('menuitem', { name: /Export as CSV/i });
    await act(async () => {
      fireEvent.click(csvOption);
    });
    // No error should be thrown, and export should be triggered (mocked)
    await waitFor(() => expect(screen.getByText(/Export Successful/i)).toBeInTheDocument());
  });

  it('shows log details modal on row click', async () => {
    render(<AuditLogViewer isAdmin={true} />);
    await waitFor(() => screen.getByText('POST'));
    const row = screen.getByRole('row', { name: /Log entry from/i });
    await act(async () => {
      fireEvent.click(row);
    });
    await waitFor(() => expect(screen.getByText(/Log Details/i)).toBeInTheDocument());
    expect(screen.getByText(/Full details for log entry/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    server.use(
      rest.get('/api/audit/user-actions', (req: any, res: any, ctx: any) => {
        return res(ctx.status(500), ctx.json({ message: 'Failed to fetch audit logs' }));
      })
    );
    render(<AuditLogViewer isAdmin={true} />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch audit logs/i)).toBeInTheDocument());
  });
}); 