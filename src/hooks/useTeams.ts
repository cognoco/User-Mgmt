/**
 * Teams Hook
 * 
 * This hook provides team management functionality.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { TeamService } from '@/core/team/interfaces';
import { 
  Team, 
  TeamCreatePayload, 
  TeamUpdatePayload, 
  TeamResult,
  TeamSearchParams,
  TeamSearchResult
} from '@/core/team/models';
import { UserManagementConfiguration } from '@/core/config';
import { useAuth } from './useAuth';

/**
 * Hook for team management functionality
 * 
 * @returns Team management state and methods
 */
export function useTeams() {
  // Get the team service from the service provider registry
  const teamService = UserManagementConfiguration.getServiceProvider<TeamService>('teamService');
  
  if (!teamService) {
    throw new Error('TeamService is not registered in the service provider registry');
  }
  
  // Get current user from auth hook
  const { user } = useAuth();
  
  // Local state for teams
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch user's teams
  const fetchUserTeams = useCallback(async (userId: string): Promise<Team[]> => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userTeams = await teamService.getUserTeams(userId);
      
      setIsLoading(false);
      setTeams(userTeams);
      
      return userTeams;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user teams';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return [];
    }
  }, [teamService]);
  
  // Fetch a specific team
  const fetchTeam = useCallback(async (teamId: string): Promise<Team | null> => {
    if (!teamId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const team = await teamService.getTeam(teamId);
      
      setIsLoading(false);
      
      if (team) {
        setCurrentTeam(team);
      }
      
      return team;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return null;
    }
  }, [teamService]);
  
  // Create a new team
  const createTeam = useCallback(async (ownerId: string, teamData: TeamCreatePayload): Promise<TeamResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.createTeam(ownerId, teamData);
      
      setIsLoading(false);
      
      if (result.success && result.team) {
        // Add the new team to the teams list
        setTeams(prevTeams => [...prevTeams, result.team!]);
        setCurrentTeam(result.team);
        setSuccessMessage('Team created successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService]);
  
  // Update a team
  const updateTeam = useCallback(async (teamId: string, teamData: TeamUpdatePayload): Promise<TeamResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.updateTeam(teamId, teamData);
      
      setIsLoading(false);
      
      if (result.success && result.team) {
        // Update the team in the teams list
        setTeams(prevTeams => 
          prevTeams.map(team => team.id === teamId ? result.team! : team)
        );
        
        // Update current team if it's the one being updated
        if (currentTeam && currentTeam.id === teamId) {
          setCurrentTeam(result.team);
        }
        
        setSuccessMessage('Team updated successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update team';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService, currentTeam]);
  
  // Delete a team
  const deleteTeam = useCallback(async (teamId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.deleteTeam(teamId);
      
      setIsLoading(false);
      
      if (result.success) {
        // Remove the team from the teams list
        setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
        
        // Clear current team if it's the one being deleted
        if (currentTeam && currentTeam.id === teamId) {
          setCurrentTeam(null);
        }
        
        setSuccessMessage('Team deleted successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService, currentTeam]);
  
  // Transfer team ownership
  const transferOwnership = useCallback(async (teamId: string, newOwnerId: string): Promise<TeamResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamService.transferOwnership(teamId, newOwnerId);
      
      setIsLoading(false);
      
      if (result.success && result.team) {
        // Update the team in the teams list
        setTeams(prevTeams => 
          prevTeams.map(team => team.id === teamId ? result.team! : team)
        );
        
        // Update current team if it's the one being updated
        if (currentTeam && currentTeam.id === teamId) {
          setCurrentTeam(result.team);
        }
        
        setSuccessMessage('Team ownership transferred successfully');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer team ownership';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [teamService, currentTeam]);
  
  // Clear any error or success messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // Fetch the current user's teams when the component mounts or the user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserTeams(user.id);
    }
  }, [user, fetchUserTeams]);
  
  return {
    // State
    teams,
    currentTeam,
    isLoading,
    error,
    successMessage,
    
    // Methods
    fetchUserTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    transferOwnership,
    clearMessages,
    
    // Helper methods
    setCurrentTeam
  };
}

export default useTeams;
