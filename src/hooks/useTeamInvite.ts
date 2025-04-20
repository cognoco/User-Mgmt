import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InviteData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  teamLicenseId: string;
}

async function inviteTeamMember(data: InviteData): Promise<void> {
  const response = await fetch('/api/team/invites/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send invitation');
  }
}

export function useTeamInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      // Invalidate team members list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });
}