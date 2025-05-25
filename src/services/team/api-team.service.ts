// API-based TeamService implementation for client-side use
import { TeamService } from '@/core/team/interfaces';
import { Team, TeamMember, TeamInvite, CreateTeamPayload, UpdateTeamPayload } from '@/core/team/models';

export class ApiTeamService implements TeamService {
  async getTeams(): Promise<Team[]> {
    const res = await fetch('/api/team', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  }

  async getTeamById(teamId: string): Promise<Team | null> {
    const res = await fetch(`/api/team/${teamId}`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  }

  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
  }

  async updateTeam(teamId: string, payload: UpdateTeamPayload): Promise<Team> {
    const res = await fetch(`/api/team/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to update team');
    return res.json();
  }

  async deleteTeam(teamId: string): Promise<void> {
    const res = await fetch(`/api/team/${teamId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete team');
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const res = await fetch(`/api/team/${teamId}/members`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch team members');
    return res.json();
  }

  async addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const res = await fetch(`/api/team/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to add team member');
    return res.json();
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const res = await fetch(`/api/team/${teamId}/members/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to remove team member');
  }

  async inviteToTeam(teamId: string, email: string): Promise<TeamInvite> {
    const res = await fetch(`/api/team/${teamId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to invite to team');
    return res.json();
  }

  async acceptTeamInvite(inviteId: string): Promise<void> {
    const res = await fetch(`/api/team/invites/${inviteId}/accept`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to accept invite');
  }

  async declineTeamInvite(inviteId: string): Promise<void> {
    const res = await fetch(`/api/team/invites/${inviteId}/decline`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to decline invite');
  }
}

export function getApiTeamService(): TeamService {
  return new ApiTeamService();
}
