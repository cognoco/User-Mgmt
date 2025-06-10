// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { InviteMemberModal } from '@/ui/headless/team/InviteMemberModal';
import { useTeamInvite } from '@/hooks/team/useTeamInvite';

vi.mock('@/hooks/team/useTeamInvite', () => ({
  useTeamInvite: vi.fn()
}));

describe('InviteMemberModal', () => {
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

  it('closes on successful invite', async () => {
    let props: any;
    render(
      <InviteMemberModal teamId="1" seatUsage={{ used: 0, total: 1 }}>
        {(p) => {
          props = p;
          return <div />;
        }}
      </InviteMemberModal>
    );

    act(() => props.open());
    expect(props.isOpen).toBe(true);

    act(() => {
      props.formProps.setEmail('a@b.com');
    });

    await act(async () => {
      await props.formProps.handleSubmit({ preventDefault() {} } as any);
    });

    expect(props.isOpen).toBe(false);
  });
});
