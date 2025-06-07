import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TestWrapper } from '@/src/tests/utils/testWrapper'179;
import { PermissionAuditDashboard } from '@/src/ui/styled/audit/PermissionAuditDashboard'248;

const mockLogs = [
  {
    id: '1',
    timestamp: '2024-06-01T10:00:00Z',
    method: 'POST',
    path: '/api',
    user_id: 'u1',
    status_code: 200,
    response_time: 50,
    action: 'ROLE_ASSIGNED',
    status: 'SUCCESS',
    details: { after: { roleId: 'r1' } }
  },
  {
    id: '2',
    timestamp: '2024-06-01T11:00:00Z',
    method: 'POST',
    path: '/api',
    user_id: 'u1',
    status_code: 200,
    response_time: 40,
    action: 'PERMISSION_ADDED',
    status: 'SUCCESS',
    details: { after: { permission: 'EDIT_USER_PROFILES' } }
  }
];

const server = setupServer(
  http.get('/api/audit/user-actions', () =>
    HttpResponse.json({ logs: mockLogs, pagination: { page:1, limit:20, total:2, totalPages:1 } })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <TestWrapper authenticated>
      <PermissionAuditDashboard />
    </TestWrapper>
  );
}

describe('PermissionAuditDashboard', () => {
  it('renders summary and timeline', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Total changes:/i)).toBeInTheDocument();
    });
    expect(screen.getByText('ROLE_ASSIGNED')).toBeInTheDocument();
    expect(screen.getByText('PERMISSION_ADDED')).toBeInTheDocument();
  });
});
