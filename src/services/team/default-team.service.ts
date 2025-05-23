/**
 * Default Team Service Implementation
 * 
 * This file implements the TeamService interface defined in the core layer.
 * It provides the default implementation for team management operations.
 */

import {
  TeamService
} from '@/core/team/interfaces';
import { 
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
  InvitationStatus,
  TeamVisibility
} from '@/core/team/models';
import { TeamEventType } from '@/core/team/events';
import type { AxiosInstance } from 'axios';
import type { TeamDataProvider } from '@/core/team/ITeamDataProvider';
import { translateError } from '@/lib/utils/error';
import { TypedEventEmitter } from '@/lib/utils/typed-event-emitter';

/**
 * Default implementation of the TeamService interface
 */
export class DefaultTeamService
  extends TypedEventEmitter<TeamEventType>
  implements TeamService
{
  
  /**
   * Constructor for DefaultTeamService
   * 
   * @param apiClient - The API client for making HTTP requests
   * @param teamDataProvider - The data provider for team operations
   */
  constructor(
    private apiClient: AxiosInstance,
    private teamDataProvider: TeamDataProvider
  ) {
    super();
  }

  /**
   * Emit a team event
   * 
   * @param event - The event to emit
   */
  private emitEvent(event: TeamEventType): void {
    this.emit(event);
  }

  /**
   * Create a new team
   * 
   * @param ownerId - ID of the user creating the team (will be the owner)
   * @param teamData - Team creation data including name, description, etc.
   * @returns Result object with success status and created team or error
   */
  async createTeam(ownerId: string, teamData: TeamCreatePayload): Promise<TeamResult> {
    try {
      const response = await this.apiClient.post('/api/teams', {
        ...teamData,
        ownerId
      });
      
      const team = response.data.team;
      
      // Emit team created event
      this.emitEvent({
        type: 'team_created',
        timestamp: Date.now(),
        team,
        createdBy: ownerId
      });
      
      return {
        success: true,
        team
      };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to create team' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get a team by ID
   * 
   * @param teamId - ID of the team to fetch
   * @returns Team data or null if not found
   */
  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const response = await this.apiClient.get(`/api/teams/${teamId}`);
      return response.data.team;
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  }
  
  /**
   * Update a team's information
   * 
   * @param teamId - ID of the team to update
   * @param teamData - Updated team data
   * @returns Result object with success status and updated team or error
   */
  async updateTeam(teamId: string, teamData: TeamUpdatePayload): Promise<TeamResult> {
    try {
      const response = await this.apiClient.put(`/api/teams/${teamId}`, teamData);
      
      const team = response.data.team;
      
      // Emit team updated event
      this.emitEvent({
        type: 'team_updated',
        timestamp: Date.now(),
        teamId,
        team,
        updatedBy: team.ownerId, // Assuming the owner is making the update
        updatedFields: Object.keys(teamData)
      });
      
      // If visibility was updated, emit a specific event for that
      if (teamData.visibility) {
        const previousTeam = await this.getTeam(teamId);
        if (previousTeam && previousTeam.visibility !== teamData.visibility) {
          this.emitEvent({
            type: 'team_visibility_changed',
            timestamp: Date.now(),
            teamId,
            previousVisibility: previousTeam.visibility,
            newVisibility: teamData.visibility,
            changedBy: team.ownerId // Assuming the owner is making the update
          });
        }
      }
      
      return {
        success: true,
        team
      };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to update team' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Delete a team
   * 
   * @param teamId - ID of the team to delete
   * @returns Result object with success status or error
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the team before deleting to know who the owner is
      const team = await this.getTeam(teamId);
      if (!team) {
        return {
          success: false,
          error: 'Team not found'
        };
      }
      
      await this.apiClient.delete(`/api/teams/${teamId}`);
      
      // Emit team deleted event
      this.emitEvent({
        type: 'team_deleted',
        timestamp: Date.now(),
        teamId,
        deletedBy: team.ownerId // Assuming the owner is deleting the team
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete team';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get all teams that a user belongs to
   * 
   * @param userId - ID of the user
   * @returns Array of teams the user belongs to
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const response = await this.apiClient.get(`/api/users/${userId}/teams`);
      return response.data.teams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  }
  
  /**
   * Get all members of a team
   * 
   * @param teamId - ID of the team
   * @returns Array of team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const response = await this.apiClient.get(`/api/teams/${teamId}/members`);
      return response.data.members;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }
  
  /**
   * Add a user to a team
   * 
   * @param teamId - ID of the team
   * @param userId - ID of the user to add
   * @param role - Role to assign to the user
   * @returns Result object with success status and team member data or error
   */
  async addTeamMember(teamId: string, userId: string, role: string): Promise<TeamMemberResult> {
    try {
      const response = await this.apiClient.post(`/api/teams/${teamId}/members`, {
        userId,
        role
      });
      
      const member = response.data.member;
      
      // Get the team to know who the owner is
      const team = await this.getTeam(teamId);
      
      // Emit team member added event
      this.emitEvent({
        type: 'team_member_added',
        timestamp: Date.now(),
        teamId,
        member,
        addedBy: team?.ownerId || userId // If we can't get the team, assume the user added themselves
      });
      
      return {
        success: true,
        member
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add team member';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Update a team member's role
   * 
   * @param teamId - ID of the team
   * @param userId - ID of the user to update
   * @param updateData - Updated member data including role
   * @returns Result object with success status and updated team member data or error
   */
  async updateTeamMember(teamId: string, userId: string, updateData: TeamMemberUpdatePayload): Promise<TeamMemberResult> {
    try {
      // Get the current member to know their previous role
      const members = await this.getTeamMembers(teamId);
      const currentMember = members.find(m => m.userId === userId);
      
      if (!currentMember) {
        return {
          success: false,
          error: 'Team member not found'
        };
      }
      
      const previousRole = currentMember.role;
      
      const response = await this.apiClient.put(`/api/teams/${teamId}/members/${userId}`, updateData);
      
      const member = response.data.member;
      
      // Get the team to know who the owner is
      const team = await this.getTeam(teamId);
      
      // If the role was changed, emit a specific event for that
      if (updateData.role && updateData.role !== previousRole) {
        this.emitEvent({
          type: 'team_member_role_changed',
          timestamp: Date.now(),
          teamId,
          userId,
          previousRole,
          newRole: updateData.role,
          changedBy: team?.ownerId || userId // If we can't get the team, assume the user changed their own role
        });
      }
      
      return {
        success: true,
        member
      };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to update team member' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Remove a user from a team
   * 
   * @param teamId - ID of the team
   * @param userId - ID of the user to remove
   * @returns Result object with success status or error
   */
  async removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the team to know who the owner is
      const team = await this.getTeam(teamId);
      
      await this.apiClient.delete(`/api/teams/${teamId}/members/${userId}`);
      
      // Emit team member removed event
      this.emitEvent({
        type: 'team_member_removed',
        timestamp: Date.now(),
        teamId,
        userId,
        removedBy: team?.ownerId || userId // If we can't get the team, assume the user removed themselves
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = translateError(error, { defaultMessage: 'Failed to remove team member' });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Transfer team ownership to another user
   * 
   * @param teamId - ID of the team
   * @param newOwnerId - ID of the user to transfer ownership to
   * @returns Result object with success status and updated team or error
   */
  async transferOwnership(teamId: string, newOwnerId: string): Promise<TeamResult> {
    try {
      // Get the team to know who the current owner is
      const team = await this.getTeam(teamId);
      
      if (!team) {
        return {
          success: false,
          error: 'Team not found'
        };
      }
      
      const previousOwnerId = team.ownerId;
      
      const response = await this.apiClient.post(`/api/teams/${teamId}/transfer-ownership`, {
        newOwnerId
      });
      
      const updatedTeam = response.data.team;
      
      // Emit team ownership transferred event
      this.emitEvent({
        type: 'team_ownership_transferred',
        timestamp: Date.now(),
        teamId,
        previousOwnerId,
        newOwnerId,
        initiatedBy: previousOwnerId // Assuming the current owner is initiating the transfer
      });
      
      return {
        success: true,
        team: updatedTeam
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to transfer team ownership';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Invite a user to join a team
   * 
   * @param teamId - ID of the team
   * @param invitationData - Invitation data including email and role
   * @returns Result object with success status and invitation data or error
   */
  async inviteToTeam(teamId: string, invitationData: TeamInvitationPayload): Promise<TeamInvitationResult> {
    try {
      // Get the team to know who the owner is
      const team = await this.getTeam(teamId);
      
      if (!team) {
        return {
          success: false,
          error: 'Team not found'
        };
      }
      
      const response = await this.apiClient.post(`/api/teams/${teamId}/invitations`, invitationData);
      
      const invitation = response.data.invitation;
      
      // Emit team invitation created event
      this.emitEvent({
        type: 'team_invitation_created',
        timestamp: Date.now(),
        invitation,
        invitedBy: team.ownerId // Assuming the owner is sending the invitation
      });
      
      return {
        success: true,
        invitation
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to invite user to team';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get all pending invitations for a team
   * 
   * @param teamId - ID of the team
   * @returns Array of pending invitations
   */
  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      const response = await this.apiClient.get(`/api/teams/${teamId}/invitations`);
      return response.data.invitations;
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      return [];
    }
  }
  
  /**
   * Get all invitations for a user (by email)
   * 
   * @param email - Email of the user
   * @returns Array of invitations for the user
   */
  async getUserInvitations(email: string): Promise<TeamInvitation[]> {
    try {
      const response = await this.apiClient.get(`/api/users/invitations?email=${encodeURIComponent(email)}`);
      return response.data.invitations;
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      return [];
    }
  }
  
  /**
   * Accept a team invitation
   * 
   * @param invitationId - ID of the invitation to accept
   * @param userId - ID of the user accepting the invitation
   * @returns Result object with success status and team member data or error
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<TeamMemberResult> {
    try {
      // Get the invitation to know the team and role
      const response = await this.apiClient.get(`/api/invitations/${invitationId}`);
      const invitation = response.data.invitation;
      
      if (!invitation) {
        return {
          success: false,
          error: 'Invitation not found'
        };
      }
      
      const acceptResponse = await this.apiClient.post(`/api/invitations/${invitationId}/accept`, {
        userId
      });
      
      const member = acceptResponse.data.member;
      
      // Emit team invitation accepted event
      this.emitEvent({
        type: 'team_invitation_accepted',
        timestamp: Date.now(),
        invitationId,
        teamId: invitation.teamId,
        userId,
        role: invitation.role
      });
      
      return {
        success: true,
        member
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to accept invitation';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Decline a team invitation
   * 
   * @param invitationId - ID of the invitation to decline
   * @returns Result object with success status or error
   */
  async declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the invitation to know the team and email
      const response = await this.apiClient.get(`/api/invitations/${invitationId}`);
      const invitation = response.data.invitation;
      
      if (!invitation) {
        return {
          success: false,
          error: 'Invitation not found'
        };
      }
      
      await this.apiClient.post(`/api/invitations/${invitationId}/decline`);
      
      // Emit team invitation declined event
      this.emitEvent({
        type: 'team_invitation_declined',
        timestamp: Date.now(),
        invitationId,
        teamId: invitation.teamId,
        email: invitation.email
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to decline invitation';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Cancel a pending invitation
   * 
   * @param invitationId - ID of the invitation to cancel
   * @returns Result object with success status or error
   */
  async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the invitation to know the team and email
      const response = await this.apiClient.get(`/api/invitations/${invitationId}`);
      const invitation = response.data.invitation;
      
      if (!invitation) {
        return {
          success: false,
          error: 'Invitation not found'
        };
      }
      
      // Get the team to know who the owner is
      const team = await this.getTeam(invitation.teamId);
      
      await this.apiClient.delete(`/api/invitations/${invitationId}`);
      
      // Emit team invitation cancelled event
      this.emitEvent({
        type: 'team_invitation_cancelled',
        timestamp: Date.now(),
        invitationId,
        teamId: invitation.teamId,
        email: invitation.email,
        cancelledBy: team?.ownerId || invitation.invitedBy // If we can't get the team, use the invitedBy field
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel invitation';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Search for teams based on search parameters
   * 
   * @param params - Search parameters
   * @returns Search results with pagination
   */
  async searchTeams(params: TeamSearchParams): Promise<TeamSearchResult> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await this.apiClient.get(`/api/teams/search?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      // Return empty result on error
      return {
        teams: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0
      };
    }
  }
  
  /**
   * Check if a user is a member of a team
   * 
   * @param teamId - ID of the team
   * @param userId - ID of the user
   * @returns True if the user is a member of the team, false otherwise
   */
  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    try {
      const members = await this.getTeamMembers(teamId);
      return members.some(member => member.userId === userId && member.isActive);
    } catch (error) {
      console.error('Error checking team membership:', error);
      return false;
    }
  }
  
  /**
   * Check if a user has a specific role in a team
   * 
   * @param teamId - ID of the team
   * @param userId - ID of the user
   * @param role - Role to check for
   * @returns True if the user has the specified role, false otherwise
   */
  async hasTeamRole(teamId: string, userId: string, role: string): Promise<boolean> {
    try {
      const members = await this.getTeamMembers(teamId);
      return members.some(member => 
        member.userId === userId && 
        member.role === role && 
        member.isActive
      );
    } catch (error) {
      console.error('Error checking team role:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to team changes
   * 
   * @param callback - Function to call when a team changes
   * @returns Unsubscribe function
   */
  onTeamChanged(callback: (team: Team) => void): () => void {
    return this.on(event => {
      if (event.type === 'team_created' || event.type === 'team_updated') {
        callback(event.team);
      }
    });
  }
  
  /**
   * Subscribe to team membership changes
   * 
   * @param callback - Function to call when team membership changes
   * @returns Unsubscribe function
   */
  onTeamMembershipChanged(callback: (teamId: string, members: TeamMember[]) => void): () => void {
    return this.on(async event => {
      if (
        event.type === 'team_member_added' ||
        event.type === 'team_member_role_changed' ||
        event.type === 'team_member_removed'
      ) {
        const members = await this.getTeamMembers(event.teamId);
        callback(event.teamId, members);
      }
    });
  }
}
