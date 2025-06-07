// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeamMembersList } from '@/src/ui/headless/team/TeamMembersList'149;
import { useTeamMembers } from '@/hooks/team/useTeamMembers';

vi.mock('@/hooks/team/useTeamMembers', () => ({
  useTeamMembers: vi.fn()
}));

describe('TeamMembersList', () => {
  const mockUpdate = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamMembers as unknown as vi.Mock).mockReturnValue({
      members: [
        { userId: 'u1', role: 'member', isActive: true, joinedAt: '', updatedAt: '', teamId: 't1' }
      ],
      updateTeamMember: mockUpdate,
      removeTeamMember: mockRemove,
      fetchTeamMembers: vi.fn(),
      isLoading: false,
      error: null
    });
  });

  it('calls updateTeamMember', async () => {
    let props: any;
    render(
      <TeamMembersList teamId="1">
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamMembersList>
    );

    await act(async () => {
      await props.updateRole('u1', 'admin');
    });

    expect(mockUpdate).toHaveBeenCalledWith('u1', { role: 'admin' });
  });

  it('calls removeTeamMember', async () => {
    let props: any;
    render(
      <TeamMembersList teamId="1">
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamMembersList>
    );

    await act(async () => {
      await props.removeMember('u1');
    });

    expect(mockRemove).toHaveBeenCalledWith('u1');
  });
});
