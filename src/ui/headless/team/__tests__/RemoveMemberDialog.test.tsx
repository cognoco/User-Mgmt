// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { RemoveMemberDialog } from '../RemoveMemberDialog';
import { useTeamMembers } from '@/hooks/team/useTeamMembers';

vi.mock('@/hooks/team/useTeamMembers', () => ({
  useTeamMembers: vi.fn()
}));

describe('RemoveMemberDialog', () => {
  const mockRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamMembers as unknown as vi.Mock).mockReturnValue({
      removeTeamMember: mockRemove,
      isLoading: false
    });
  });

  it('calls removeTeamMember when confirmed', async () => {
    let props: any;
    render(
      <RemoveMemberDialog teamId="1" memberId="u1" isOpen={true}>
        {(p) => {
          props = p;
          return <div />;
        }}
      </RemoveMemberDialog>
    );

    act(() => props.setConfirmText('remove'));
    await act(async () => {
      await props.confirm();
    });

    expect(mockRemove).toHaveBeenCalledWith('u1');
  });
});
