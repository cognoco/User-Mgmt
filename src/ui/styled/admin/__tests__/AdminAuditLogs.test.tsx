// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminAuditLogs } from '@/ui/styled/admin/audit-logs/AdminAuditLogs';

import { __setIsError } from '@/tests/mocks/headlessAdminAuditLogs.mock';
vi.mock('@/ui/headless/admin/audit-logs/AdminAuditLogs', async () => await import('@/tests/mocks/headlessAdminAuditLogs.mock'));
vi.mock('@/ui/styled/audit/AuditLogViewer', async () => await import('@/tests/mocks/auditLogViewer.mock'));
vi.mock('@/ui/primitives/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe('AdminAuditLogs', () => {
  beforeEach(() => {
    __setIsError(false);
    vi.clearAllMocks();
  });

  it('renders the audit log viewer when no error occurs', () => {
    render(<AdminAuditLogs />);
    expect(screen.getByTestId('audit-log-viewer')).toBeInTheDocument();
  });

  it('shows an error message when fetching logs fails', () => {
    __setIsError(true);
    render(<AdminAuditLogs />);
    expect(screen.getByText(/failed to fetch audit logs/i)).toBeInTheDocument();
  });
});
