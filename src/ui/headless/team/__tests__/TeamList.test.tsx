// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeamList } from '@/ui/headless/team/TeamList';
import { useTeams } from '@/hooks/team/useTeams';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/team/useTeams', () => ({ useTeams: vi.fn() }));
vi.mock('@/hooks/auth/useAuth', () => ({ useAuth: vi.fn() }));

describe('TeamList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: { id: 'u1' } });
    (useTeams as unknown as vi.Mock).mockReturnValue({
      teams: [
        { id: 't1', name: 'Alpha', ownerId: '', isActive: true, visibility: 'public', memberLimit: 0, createdAt: '', updatedAt: '' },
        { id: 't2', name: 'Beta', ownerId: '', isActive: true, visibility: 'public', memberLimit: 0, createdAt: '', updatedAt: '' }
      ],
      currentTeam: null,
      fetchUserTeams: vi.fn(),
      setCurrentTeam: vi.fn(),
      isLoading: false,
      error: null
    });
  });

  it('filters teams based on filter value', () => {
    let props: any;
    render(
      <TeamList>
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamList>
    );

    expect(props.teams.length).toBe(2);
    act(() => {
      props.setFilter('bet');
    });
    expect(props.teams.length).toBe(1);
    expect(props.teams[0].id).toBe('t2');
  });

  it('selects a team and calls setCurrentTeam', () => {
    const mockSet = vi.fn();
    (useTeams as unknown as vi.Mock).mockReturnValueOnce({
      teams: [
        { id: 't1', name: 'Alpha', ownerId: '', isActive: true, visibility: 'public', memberLimit: 0, createdAt: '', updatedAt: '' }
      ],
      currentTeam: null,
      fetchUserTeams: vi.fn(),
      setCurrentTeam: mockSet,
      isLoading: false,
      error: null
    });

    let props: any;
    render(
      <TeamList>
        {(p) => {
          props = p;
          return <div />;
        }}
      </TeamList>
    );

    act(() => {
      props.selectTeam('t1');
    });

    expect(mockSet).toHaveBeenCalled();
  });
});
