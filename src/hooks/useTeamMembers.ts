import { useQuery } from '@tanstack/react-query';

export type TeamRole = 'admin' | 'member' | 'viewer';
export type TeamMemberStatus = 'active' | 'pending';

interface TeamMember {
  id: string;
  role: TeamRole;
  status: TeamMemberStatus;
  lastActive?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  invitedEmail?: string;
}

interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
  page: number;
  totalPages: number;
}

interface UseTeamMembersParams {
  teamLicenseId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: TeamRole;
  status?: TeamMemberStatus;
}

export function useTeamMembers({
  teamLicenseId,
  page = 1,
  limit = 10,
  search,
  role,
  status,
}: UseTeamMembersParams) {
  return useQuery<TeamMembersResponse>({
    queryKey: ['team-members', teamLicenseId, page, limit, search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        teamLicenseId,
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/team/members?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch team members');
      }

      return response.json();
    },
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData
  });
} 