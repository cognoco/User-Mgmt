/**
 * Team Management Domain Events
 * 
 * This file defines the events that can be emitted by the team management service.
 * These events allow other parts of the application to react to team changes.
 */

import { Team, TeamMember, TeamInvitation, TeamVisibility } from '@/core/team/models';

/**
 * Base event interface that all team management events extend
 */
export interface TeamEvent {
  /**
   * Type of the event
   */
  type: string;
  
  /**
   * Timestamp when the event occurred
   */
  timestamp: number;
}

/**
 * Event emitted when a new team is created
 */
export interface TeamCreatedEvent extends TeamEvent {
  type: 'team_created';
  
  /**
   * The newly created team
   */
  team: Team;
  
  /**
   * ID of the user who created the team
   */
  createdBy: string;
}

/**
 * Event emitted when a team is updated
 */
export interface TeamUpdatedEvent extends TeamEvent {
  type: 'team_updated';
  
  /**
   * ID of the team that was updated
   */
  teamId: string;
  
  /**
   * The updated team
   */
  team: Team;
  
  /**
   * ID of the user who updated the team
   */
  updatedBy: string;
  
  /**
   * Fields that were updated
   */
  updatedFields: string[];
}

/**
 * Event emitted when a team is deleted
 */
export interface TeamDeletedEvent extends TeamEvent {
  type: 'team_deleted';
  
  /**
   * ID of the team that was deleted
   */
  teamId: string;
  
  /**
   * ID of the user who deleted the team
   */
  deletedBy: string;
}

/**
 * Event emitted when a team's visibility changes
 */
export interface TeamVisibilityChangedEvent extends TeamEvent {
  type: 'team_visibility_changed';
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * Previous visibility setting
   */
  previousVisibility: TeamVisibility;
  
  /**
   * New visibility setting
   */
  newVisibility: TeamVisibility;
  
  /**
   * ID of the user who changed the visibility
   */
  changedBy: string;
}

/**
 * Event emitted when a user is added to a team
 */
export interface TeamMemberAddedEvent extends TeamEvent {
  type: 'team_member_added';
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * The newly added team member
   */
  member: TeamMember;
  
  /**
   * ID of the user who added the member
   */
  addedBy: string;
}

/**
 * Event emitted when a team member's role is updated
 */
export interface TeamMemberRoleChangedEvent extends TeamEvent {
  type: 'team_member_role_changed';
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * ID of the member whose role was changed
   */
  userId: string;
  
  /**
   * Previous role
   */
  previousRole: string;
  
  /**
   * New role
   */
  newRole: string;
  
  /**
   * ID of the user who changed the role
   */
  changedBy: string;
}

/**
 * Event emitted when a user is removed from a team
 */
export interface TeamMemberRemovedEvent extends TeamEvent {
  type: 'team_member_removed';
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * ID of the removed member
   */
  userId: string;
  
  /**
   * ID of the user who removed the member
   */
  removedBy: string;
}

/**
 * Event emitted when team ownership is transferred
 */
export interface TeamOwnershipTransferredEvent extends TeamEvent {
  type: 'team_ownership_transferred';
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * ID of the previous owner
   */
  previousOwnerId: string;
  
  /**
   * ID of the new owner
   */
  newOwnerId: string;
  
  /**
   * ID of the user who initiated the transfer
   */
  initiatedBy: string;
}

/**
 * Event emitted when a user is invited to a team
 */
export interface TeamInvitationCreatedEvent extends TeamEvent {
  type: 'team_invitation_created';
  
  /**
   * The created invitation
   */
  invitation: TeamInvitation;
  
  /**
   * ID of the user who created the invitation
   */
  invitedBy: string;
}

/**
 * Event emitted when a team invitation is accepted
 */
export interface TeamInvitationAcceptedEvent extends TeamEvent {
  type: 'team_invitation_accepted';
  
  /**
   * ID of the invitation
   */
  invitationId: string;
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * ID of the user who accepted the invitation
   */
  userId: string;
  
  /**
   * Role assigned to the user
   */
  role: string;
}

/**
 * Event emitted when a team invitation is declined
 */
export interface TeamInvitationDeclinedEvent extends TeamEvent {
  type: 'team_invitation_declined';
  
  /**
   * ID of the invitation
   */
  invitationId: string;
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * Email of the invited user
   */
  email: string;
}

/**
 * Event emitted when a team invitation is cancelled
 */
export interface TeamInvitationCancelledEvent extends TeamEvent {
  type: 'team_invitation_cancelled';
  
  /**
   * ID of the invitation
   */
  invitationId: string;
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * Email of the invited user
   */
  email: string;
  
  /**
   * ID of the user who cancelled the invitation
   */
  cancelledBy: string;
}

/**
 * Event emitted when a team invitation expires
 */
export interface TeamInvitationExpiredEvent extends TeamEvent {
  type: 'team_invitation_expired';
  
  /**
   * ID of the invitation
   */
  invitationId: string;
  
  /**
   * ID of the team
   */
  teamId: string;
  
  /**
   * Email of the invited user
   */
  email: string;
}

/**
 * Union type of all team management events
 */
export type TeamEventType = 
  | TeamCreatedEvent
  | TeamUpdatedEvent
  | TeamDeletedEvent
  | TeamVisibilityChangedEvent
  | TeamMemberAddedEvent
  | TeamMemberRoleChangedEvent
  | TeamMemberRemovedEvent
  | TeamOwnershipTransferredEvent
  | TeamInvitationCreatedEvent
  | TeamInvitationAcceptedEvent
  | TeamInvitationDeclinedEvent
  | TeamInvitationCancelledEvent
  | TeamInvitationExpiredEvent;
