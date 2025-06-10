/**
 * Team Invite Hook
 * 
 * This hook provides functionality for inviting users to a team.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useCallback } from 'react';
import { TeamService } from '@/core/team/interfaces';
import { TeamInvitationPayload, TeamInvitationResult } from '@/core/team/models';
import { UserManagementConfiguration } from '@/core/config';

/**
 * Hook for team invitation functionality
 * 
 * @returns Team invitation state and methods
 */
export function useTeamInvite() {
  // Get the team service from the service provider registry
  const teamService = UserManagementConfiguration.getServiceProvider<TeamService>('teamService');
  
  if (!teamService) {
    throw new Error('TeamService is not registered in the service provider registry');
  }
  
  // Local state for invitation
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Send invitation
  const inviteToTeam = useCallback(async (teamId: string, invitationData: TeamInvitationPayload): Promise<TeamInvitationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.inviteToTeam(teamId, invitationData);
      
      setIsLoading(false);
      
      if (result.success) {
        setSuccessMessage('Invitation sent successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  return {
    // State
    isLoading,
    error,
    successMessage,
    
    // Methods
    inviteToTeam,
    clearMessages
  };
}