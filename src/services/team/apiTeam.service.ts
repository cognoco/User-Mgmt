// API-based TeamService implementation for client-side use
import { TeamService } from '@/core/team/interfaces';
import { Team, TeamMember, TeamInvite, CreateTeamPayload, UpdateTeamPayload } from '@/core/team/models';

/** Client-side {@link TeamService} communicating with `/api/team` endpoints. */
export class ApiTeamService implements TeamService {
  /**
   * Fetch all teams visible to the current user.
   */
  async getTeams(): Promise<Team[]> {
    const res = await fetch('/api/team', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  }

  /**
   * Fetch a team by its ID.
   *
   * @param teamId - Identifier of the team
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const res = await fetch(`/api/team/${teamId}`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  }

  /**
   * Create a new team.
   *
   * @param payload - Data for the new team
   */
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

  /**
   * Update an existing team.
   *
   * @param teamId - Team identifier
   * @param payload - Updated fields
   */
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

  /**
   * Delete a team by ID.
   *
   * @param teamId - Team identifier
   */
  async deleteTeam(teamId: string): Promise<void> {
    const res = await fetch(`/api/team/${teamId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete team');
  }

  /**
   * Get all members belonging to a team.
   *
   * @param teamId - Team identifier
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const res = await fetch(`/api/team/${teamId}/members`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch team members');
    return res.json();
  }

  /**
   * Add a user to a team.
   *
   * @param teamId - Target team
   * @param userId - User to add
   */
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

  /**
   * Remove a member from a team.
   *
   * @param teamId - Team ID
   * @param userId - User ID to remove
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const res = await fetch(`/api/team/${teamId}/members/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to remove team member');
  }

  /**
   * Invite a user to join a team.
   *
   * @param teamId - Team identifier
   * @param email - Email of the invitee
   */
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

  /**
   * Accept a team invitation.
   *
   * @param inviteId - Invitation identifier
   */
  async acceptTeamInvite(inviteId: string): Promise<void> {
    const res = await fetch(`/api/team/invites/${inviteId}/accept`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to accept invite');
  }

  /**
   * Decline a team invitation.
   *
   * @param inviteId - Invitation identifier
   */
  async declineTeamInvite(inviteId: string): Promise<void> {
    const res = await fetch(`/api/team/invites/${inviteId}/decline`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to decline invite');
  }
}

/**
 * Factory helper to create the browser {@link ApiTeamService}.
 */
export function getApiTeamService(): TeamService {
  return new ApiTeamService();
}
