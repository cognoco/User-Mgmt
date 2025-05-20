/**
 * Team Members Hook
 * 
 * This hook provides team member management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { TeamService } from '@/core/team/interfaces';
import { 
  TeamMember, 
  TeamMemberUpdatePayload, 
  TeamMemberResult 
} from '@/core/team/models';
import { UserManagementConfiguration } from '@/core/config';

/**
 * Hook for team member management functionality
 * 
 * @param teamId ID of the team to manage members for
 * @returns Team member management state and methods
 */
export function useTeamMembers(teamId: string) {
  // Get the team service from the service provider registry
  const teamService = UserManagementConfiguration.getServiceProvider<TeamService>('teamService');
  
  if (!teamService) {
    throw new Error('TeamService is not registered in the service provider registry');
  }
  
  // Local state for team members
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch team members
  const fetchTeamMembers = useCallback(async (): Promise<TeamMember[]> => {
    if (!teamId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const teamMembers = await teamService.getTeamMembers(teamId);
      
      setIsLoading(false);
      setMembers(teamMembers);
      
      return teamMembers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [teamId, teamService]);
  
  // Add a team member
  const addTeamMember = useCallback(async (userId: string, role: string): Promise<TeamMemberResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.addTeamMember(teamId, userId, role);
      
      setIsLoading(false);
      
      if (result.success && result.member) {
        // Add the new member to the members list
        setMembers(prevMembers => [...prevMembers, result.member!]);
        setSuccessMessage('Team member added successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add team member';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamId, teamService]);
  
  // Update a team member
  const updateTeamMember = useCallback(async (userId: string, updateData: TeamMemberUpdatePayload): Promise<TeamMemberResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.updateTeamMember(teamId, userId, updateData);
      
      setIsLoading(false);
      
      if (result.success && result.member) {
        // Update the member in the members list
        setMembers(prevMembers => 
          prevMembers.map(member => member.userId === userId ? result.member! : member)
        );
        setSuccessMessage('Team member updated successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update team member';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamId, teamService]);
  
  // Remove a team member
  const removeTeamMember = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.removeTeamMember(teamId, userId);
      
      setIsLoading(false);
      
      if (result.success) {
        // Remove the member from the members list
        setMembers(prevMembers => prevMembers.filter(member => member.userId !== userId));
        setSuccessMessage('Team member removed successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove team member';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamId, teamService]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // Fetch team members when the component mounts or the team ID changes
  useEffect(() => {
    if (teamId) {
      fetchTeamMembers();
    }
  }, [teamId, fetchTeamMembers]);
  
  return {
    // State
    members,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    clearMessages
  };
}