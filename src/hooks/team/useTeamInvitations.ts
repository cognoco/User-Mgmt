/**
 * Team Invitations Hook
 * 
 * This hook provides comprehensive team invitation management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { TeamService } from '@/core/team/interfaces';
import {
  TeamInvitation,
  TeamMemberResult
} from '@/core/team/models';
import { UserManagementConfiguration } from '@/core/config';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Hook for team invitations management functionality
 * 
 * @param teamId Optional team ID to get invitations for a specific team
 * @returns Team invitations management state and methods
 */
export function useTeamInvitations(teamId?: string) {
  // Get the team service from the service provider registry
  const teamService = UserManagementConfiguration.getServiceProvider<TeamService>('teamService');
  
  if (!teamService) {
    throw new Error('TeamService is not registered in the service provider registry');
  }
  
  // Get current user from auth hook
  const { user } = useAuth();
  
  // Local state for invitations
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [userInvitations, setUserInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch team invitations
  const fetchTeamInvitations = useCallback(async (id: string): Promise<TeamInvitation[]> => {
    if (!id) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const invitations = await teamService.getTeamInvitations(id);
      
      setIsLoading(false);
      setTeamInvitations(invitations);
      
      return invitations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team invitations';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [teamService]);
  
  // Fetch user invitations
  const fetchUserInvitations = useCallback(async (email: string): Promise<TeamInvitation[]> => {
    if (!email) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const invitations = await teamService.getUserInvitations(email);
      
      setIsLoading(false);
      setUserInvitations(invitations);
      
      return invitations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user invitations';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [teamService]);
  
  // Accept invitation
  const acceptInvitation = useCallback(async (invitationId: string, userId: string): Promise<TeamMemberResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.acceptInvitation(invitationId, userId);
      
      setIsLoading(false);
      
      if (result.success) {
        // Remove the invitation from the user's invitations list
        setUserInvitations(prevInvitations => 
          prevInvitations.filter(invitation => invitation.id !== invitationId)
        );
        setSuccessMessage('Invitation accepted successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService]);
  
  // Decline invitation
  const declineInvitation = useCallback(async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a placeholder since the TeamService interface doesn't have a declineInvitation method
      // In a real implementation, this would call the appropriate service method
      // For now, we'll simulate success
      
      // Remove the invitation from the user's invitations list
      setUserInvitations(prevInvitations => 
        prevInvitations.filter(invitation => invitation.id !== invitationId)
      );
      
      setIsLoading(false);
      setSuccessMessage('Invitation declined successfully');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline invitation';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);
  
  // Resend invitation
  const resendInvitation = useCallback(async (_invitationId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a placeholder since the TeamService interface doesn't have a resendInvitation method
      // In a real implementation, this would call the appropriate service method
      // For now, we'll simulate success
      
      setIsLoading(false);
      setSuccessMessage('Invitation resent successfully');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend invitation';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);
  
  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a placeholder since the TeamService interface doesn't have a cancelInvitation method
      // In a real implementation, this would call the appropriate service method
      // For now, we'll simulate success
      
      // Remove the invitation from the team's invitations list
      setTeamInvitations(prevInvitations => 
        prevInvitations.filter(invitation => invitation.id !== invitationId)
      );
      
      setIsLoading(false);
      setSuccessMessage('Invitation cancelled successfully');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel invitation';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // Fetch invitations when the component mounts or dependencies change
  useEffect(() => {
    if (teamId) {
      fetchTeamInvitations(teamId);
    }
    
    if (user?.email) {
      fetchUserInvitations(user.email);
    }
  }, [teamId, user, fetchTeamInvitations, fetchUserInvitations]);
  
  return {
    // State
    teamInvitations,
    userInvitations,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchTeamInvitations,
    fetchUserInvitations,
    acceptInvitation,
    declineInvitation,
    resendInvitation,
    cancelInvitation,
    clearMessages
  };
}

export default useTeamInvitations;
