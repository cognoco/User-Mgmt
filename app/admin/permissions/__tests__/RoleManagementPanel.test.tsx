// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleManagementPanel from '../RoleManagementPanel';
import { usePermission } from '@/hooks/permission/usePermissions';

vi.mock('@/hooks/permission/usePermissions');
vi.mock('@/ui/styled/permission/RoleManager', () => ({
  RoleManager: () => <div>role manager</div>,
}));

describe('RoleManagementPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while permission check in progress', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: true } as any);
    render(<RoleManagementPanel />);
    expect(screen.getByText(/loading permissions/i)).toBeInTheDocument();
  });

  it('renders nothing when permission denied', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: false } as any);
    const { container } = render(<RoleManagementPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders role manager when permission granted', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: true, isLoading: false } as any);
    render(<RoleManagementPanel />);
    expect(screen.getByText(/role manager/i)).toBeInTheDocument();
  });
});
