import { useEffect, useMemo, useState } from 'react';
import { useTeams } from '@/hooks/team/useTeams';
import { useAuth } from '@/hooks/auth/useAuth';
import type { Team } from '@/core/team/models';

export interface TeamListRenderProps {
  teams: Team[];
  filter: string;
  setFilter: (value: string) => void;
  selectedTeam: Team | null;
  selectTeam: (teamId: string) => void;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface TeamListProps {
  onSelectTeam?: (team: Team) => void;
  children: (props: TeamListRenderProps) => React.ReactNode;
}

export function TeamList({ onSelectTeam, children }: TeamListProps) {
  const { user } = useAuth();
  const {
    teams,
    currentTeam,
    fetchUserTeams,
    setCurrentTeam,
    isLoading,
    error
  } = useTeams();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserTeams(user.id);
    }
  }, [user, fetchUserTeams]);

  const filteredTeams = useMemo(
    () => teams.filter(t => t.name.toLowerCase().includes(filter.toLowerCase())),
    [teams, filter]
  );

  const selectTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    setCurrentTeam(team);
    onSelectTeam?.(team);
  };

  const refresh = async () => {
    if (user?.id) {
      await fetchUserTeams(user.id);
    }
  };

  return (
    <>{children({
      teams: filteredTeams,
      filter,
      setFilter,
      selectedTeam: currentTeam,
      selectTeam,
      refresh,
      isLoading,
      error,
    })}</>
  );
}

export default TeamList;
