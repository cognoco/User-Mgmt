// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TeamManagement } from '@/ui/headless/team/TeamManagement';
import { useTeams } from '@/hooks/team/useTeams';
import { useTeamMembers } from '@/hooks/team/useTeamMembers';
import { useTeamInvitations } from '@/hooks/team/useTeamInvitations';

vi.mock('@/hooks/team/useTeams', () => ({ useTeams: vi.fn() }));
vi.mock('@/hooks/team/useTeamMembers', () => ({ useTeamMembers: vi.fn() }));
vi.mock('@/hooks/team/useTeamInvitations', () => ({ useTeamInvitations: vi.fn() }));

describe('TeamManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTeams as unknown as vi.Mock).mockReturnValue({
      fetchTeam: vi.fn(),
      currentTeam: { id: '1', name: 'Test' },
      isLoading: false,
      error: null
    });
    (useTeamMembers as unknown as vi.Mock).mockReturnValue({
      members: [],
      fetchTeamMembers: vi.fn(),
      isLoading: false,
      error: null
    });
    (useTeamInvitations as unknown as vi.Mock).mockReturnValue({
      teamInvitations: [],
      fetchTeamInvitations: vi.fn(),
      isLoading: false,
      error: null
    });
  });

  it('provides team data to children', () => {
    let props: any;
    render(
      <TeamManagement teamId="1">
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamManagement>
    );

    expect(props.team).toEqual({ id: '1', name: 'Test' });
  });
});
