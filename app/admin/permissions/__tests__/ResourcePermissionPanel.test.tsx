// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResourcePermissionPanel from '@/app/admin/permissions/ResourcePermissionPanel'152;
import { usePermission } from '@/hooks/permission/usePermissions';
import { UserManagementConfiguration } from '@/core/config';

vi.mock('@/hooks/permission/usePermissions');
vi.mock('@/ui/primitives/input', () => ({ Input: (props: any) => <input {...props} /> }));
vi.mock('@/ui/primitives/button', () => ({ Button: (props: any) => <button {...props}>{props.children}</button> }));
vi.mock('@/ui/primitives/select', () => ({ Select: (props: any) => <select {...props}>{props.children}</select> }));
vi.mock('@/core/config', () => ({ UserManagementConfiguration: { getServiceProvider: vi.fn() } }));

describe('ResourcePermissionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (UserManagementConfiguration.getServiceProvider as unknown as vi.Mock).mockReturnValue(undefined);
  });

  it('shows loading state while permission check in progress', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: true } as any);
    render(<ResourcePermissionPanel />);
    expect(screen.getByText(/loading permissions/i)).toBeInTheDocument();
  });

  it('renders nothing when permission denied', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: false, isLoading: false } as any);
    const { container } = render(<ResourcePermissionPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders panel when permission granted', () => {
    vi.mocked(usePermission).mockReturnValue({ hasPermission: true, isLoading: false } as any);
    render(<ResourcePermissionPanel />);
    expect(screen.getByText('Resource Permissions')).toBeInTheDocument();
  });
});
