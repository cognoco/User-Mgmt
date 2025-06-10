// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TeamInviteDialog } from '@/ui/headless/team/TeamInviteDialog';
import { useTeamInvitations } from '@/hooks/team/useTeamInvitations';

vi.mock('@/hooks/team/useTeamInvitations', () => ({
  useTeamInvitations: vi.fn()
}));

describe('TeamInviteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamInvitations as unknown as vi.Mock).mockReturnValue({
      teamInvitations: [],
      fetchTeamInvitations: vi.fn(),
      resendInvitation: vi.fn(),
      cancelInvitation: vi.fn(),
      isLoading: false,
      error: null
    });
  });

  it('renders with invitations prop', () => {
    let props: any;
    render(
      <TeamInviteDialog teamId="1">
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamInviteDialog>
    );

    expect(Array.isArray(props.invitations)).toBe(true);
  });
});
