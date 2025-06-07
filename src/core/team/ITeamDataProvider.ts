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
} from '@/core/team/models';

export interface ITeamDataProvider {
  /**
   * Create a new team.
   *
   * @param ownerId - ID of the user creating the team. This user becomes the owner.
   * @param teamData - Payload describing the team to be created.
   * @returns Result object containing the created team or an error message.
   */
  createTeam(ownerId: string, teamData: TeamCreatePayload): Promise<TeamResult>;

  /**
   * Retrieve a team by its identifier.
   *
   * @param teamId - Unique team identifier.
   * @returns The team if found, otherwise `null`.
   */
  getTeam(teamId: string): Promise<Team | null>;

  /**
   * Update an existing team.
   *
   * @param teamId - ID of the team to update.
   * @param teamData - Fields to update on the team.
   * @returns Result object containing the updated team or an error message.
   */
  updateTeam(teamId: string, teamData: TeamUpdatePayload): Promise<TeamResult>;

  /**
   * Delete a team.
   *
   * @param teamId - ID of the team to delete.
   * @returns Object with success flag and optional error message.
   */
  deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get all teams a user belongs to.
   *
   * @param userId - ID of the user.
   * @returns Array of teams the user is a member of.
   */
  getUserTeams(userId: string): Promise<Team[]>;

  /**
   * List all members of a team.
   *
   * @param teamId - ID of the team.
   * @returns Array of team members.
   */
  getTeamMembers(teamId: string): Promise<TeamMember[]>;

  /**
   * Add a member to a team.
   *
   * @param teamId - ID of the team.
   * @param userId - ID of the user to add.
   * @param role - Role assigned to the user within the team.
   * @returns Result object containing the created team member or an error message.
   */
  addTeamMember(
    teamId: string,
    userId: string,
    role: string,
  ): Promise<TeamMemberResult>;

  /**
   * Update a team member.
   *
   * @param teamId - ID of the team.
   * @param userId - ID of the user to update.
   * @param updateData - Fields to update on the member.
   * @returns Result object containing the updated member or an error message.
   */
  updateTeamMember(
    teamId: string,
    userId: string,
    updateData: TeamMemberUpdatePayload,
  ): Promise<TeamMemberResult>;

  /**
   * Remove a user from a team.
   *
   * @param teamId - ID of the team.
   * @param userId - ID of the user to remove.
   * @returns Object with success flag and optional error message.
   */
  removeTeamMember(
    teamId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Transfer ownership of a team to another user.
   *
   * @param teamId - ID of the team.
   * @param newOwnerId - ID of the user who will become the new owner.
   * @returns Result object containing the updated team or an error message.
   */
  transferOwnership(teamId: string, newOwnerId: string): Promise<TeamResult>;

  /**
   * Invite a user to join a team.
   *
   * @param teamId - ID of the team sending the invitation.
   * @param invitationData - Invitation details including email and role.
   * @returns Result object containing the created invitation or an error message.
   */
  inviteToTeam(
    teamId: string,
    invitationData: TeamInvitationPayload,
  ): Promise<TeamInvitationResult>;

  /**
   * Get pending invitations for a team.
   *
   * @param teamId - ID of the team.
   * @returns Array of invitations awaiting response.
   */
  getTeamInvitations(teamId: string): Promise<TeamInvitation[]>;

  /**
   * Get invitations for a user by their email address.
   *
   * @param email - Email of the invited user.
   * @returns Array of invitations addressed to the email.
   */
  getUserInvitations(email: string): Promise<TeamInvitation[]>;

  /**
   * Accept a team invitation.
   *
   * @param invitationId - ID of the invitation being accepted.
   * @param userId - ID of the user accepting the invitation.
   * @returns Result object with the new team member or an error message.
   */
  acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<TeamMemberResult>;

  /**
   * Decline a team invitation.
   *
   * @param invitationId - ID of the invitation being declined.
   * @returns Object with success flag and optional error message.
   */
  declineInvitation(
    invitationId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Cancel a pending invitation.
   *
   * @param invitationId - ID of the invitation to cancel.
   * @returns Object with success flag and optional error message.
   */
  cancelInvitation(
    invitationId: string,
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Search for teams based on filter parameters.
   *
   * Supports pagination and sorting as defined by {@link TeamSearchParams}.
   *
   * @param params - Search parameters.
   * @returns Paginated search results.
   */
  searchTeams(params: TeamSearchParams): Promise<TeamSearchResult>;

  /**
   * Determine whether a user is a member of a team.
   *
   * @param teamId - ID of the team.
   * @param userId - ID of the user.
   * @returns `true` if the user is a member, otherwise `false`.
   */
  isTeamMember(teamId: string, userId: string): Promise<boolean>;

  /**
   * Determine whether a user has a specific role in a team.
   *
   * @param teamId - ID of the team.
   * @param userId - ID of the user.
   * @param role - Role to check.
   * @returns `true` if the user has the role, otherwise `false`.
   */
  hasTeamRole(teamId: string, userId: string, role: string): Promise<boolean>;

  /**
   * Subscribe to team changes.
   *
   * @param callback - Function invoked when a team is created or updated.
   * @returns Function to unsubscribe from the updates.
   */
  onTeamChanged(callback: (team: Team) => void): () => void;

  /**
   * Subscribe to team membership changes.
   *
   * @param callback - Function invoked when members are added, removed or updated.
   * @returns Function to unsubscribe from the updates.
   */
  onTeamMembershipChanged(
    callback: (teamId: string, members: TeamMember[]) => void,
  ): () => void;
}
