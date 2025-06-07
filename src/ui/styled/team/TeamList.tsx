import React from 'react';
import { TeamList as HeadlessTeamList, TeamListProps } from '@/src/ui/headless/team/TeamList'28;
import { Input } from '@/ui/primitives/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';

export interface StyledTeamListProps extends Omit<TeamListProps, 'children'> {
  title?: string;
  className?: string;
}

export function TeamList({ title = 'Your Teams', className, ...props }: StyledTeamListProps) {
  return (
    <HeadlessTeamList {...props}>
      {({ teams, filter, setFilter, selectedTeam, selectTeam, isLoading, error }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Filter teams..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <ul className="space-y-2">
              {teams.map(team => (
                <li key={team.id}>
                  <Button
                    variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => selectTeam(team.id)}
                    disabled={isLoading}
                  >
                    {team.name}
                  </Button>
                </li>
              ))}
              {teams.length === 0 && !isLoading && (
                <li className="text-sm text-muted-foreground">No teams found</li>
              )}
              {isLoading && <li className="text-sm">Loading...</li>}
            </ul>
          </CardContent>
        </Card>
      )}
    </HeadlessTeamList>
  );
}

export default TeamList;
