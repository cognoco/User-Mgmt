// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { InviteMemberForm } from '@/src/ui/headless/team/InviteMemberForm';
import { useTeamInvite } from '@/hooks/team/useTeamInvite';

vi.mock('@/hooks/team/useTeamInvite', () => ({
  useTeamInvite: vi.fn()
}));

describe('InviteMemberForm', () => {
  const mockInvite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamInvite as unknown as vi.Mock).mockReturnValue({
      inviteToTeam: mockInvite,
      isLoading: false,
      error: null,
      successMessage: null
    });
  });

  it('calls inviteToTeam with form values', async () => {
    let props: any;
    render(
      <InviteMemberForm teamId="1">
        {(p) => {
          props = p;
          return <div />;
        }}
      </InviteMemberForm>
    );

    act(() => {
      props.setEmail('test@example.com');
      props.setRole('admin');
    });

    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });

    expect(mockInvite).toHaveBeenCalledWith('1', {
      email: 'test@example.com',
      role: 'admin'
    });
  });
});
