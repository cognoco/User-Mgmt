/**
 * Team Data Provider Interface
 *
 * Defines the contract for persistence operations related to teams,
 * team members and invitations. Implementations are responsible only
 * for data access and should not contain business logic.
 */
import type {
  Team,
  TeamMember,
  TeamInvitation,
  TeamCreatePayload,
  TeamUpdatePayload,
  TeamMemberUpdatePayload,
  TeamInvitationPayload,
  TeamResult,
  TeamMemberResult,
  TeamInvitationResult,
  TeamSearchParams,
  TeamSearchResult,
} from './models';

export interface ITeamDataProvider {
  /** Create a new team */
  createTeam(ownerId: string, teamData: TeamCreatePayload): Promise<TeamResult>;

  /** Retrieve a team by id */
  getTeam(teamId: string): Promise<Team | null>;

  /** Update an existing team */
  updateTeam(teamId: string, teamData: TeamUpdatePayload): Promise<TeamResult>;

  /** Delete a team */
  deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }>;

  /** Return all teams a user belongs to */
  getUserTeams(userId: string): Promise<Team[]>;

  /** List all members of a team */
  getTeamMembers(teamId: string): Promise<TeamMember[]>;

  /** Add a member to a team */
  addTeamMember(
    teamId: string,
    userId: string,
    role: string,
  ): Promise<TeamMemberResult>;

  /** Update a team member */
  updateTeamMember(
    teamId: string,
    userId: string,
    updateData: TeamMemberUpdatePayload,
  ): Promise<TeamMemberResult>;

  /** Remove a user from a team */
  removeTeamMember(
    teamId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /** Transfer ownership of a team */
  transferOwnership(teamId: string, newOwnerId: string): Promise<TeamResult>;

  /** Invite a user to join a team */
  inviteToTeam(
    teamId: string,
    invitationData: TeamInvitationPayload,
  ): Promise<TeamInvitationResult>;

  /** Get pending invitations for a team */
  getTeamInvitations(teamId: string): Promise<TeamInvitation[]>;

  /** Get invitations for a user by email */
  getUserInvitations(email: string): Promise<TeamInvitation[]>;

  /** Accept a team invitation */
  acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<TeamMemberResult>;

  /** Decline a team invitation */
  declineInvitation(
    invitationId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /** Cancel a pending invitation */
  cancelInvitation(
    invitationId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /** Search for teams */
  searchTeams(params: TeamSearchParams): Promise<TeamSearchResult>;

  /** Check whether a user belongs to a team */
  isTeamMember(teamId: string, userId: string): Promise<boolean>;

  /** Check whether a user has a role in a team */
  hasTeamRole(teamId: string, userId: string, role: string): Promise<boolean>;

  /** Subscribe to team changes */
  onTeamChanged(callback: (team: Team) => void): () => void;

  /** Subscribe to team membership changes */
  onTeamMembershipChanged(
    callback: (teamId: string, members: TeamMember[]) => void,
  ): () => void;
}
