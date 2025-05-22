import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/primitives/alert-dialog';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name?: string;
    email: string;
  };
  teamLicenseId: string;
}

async function removeMember(memberId: string): Promise<void> {
  const response = await fetch(`/api/team/members/${memberId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove team member');
  }
}

export function RemoveMemberDialog({
  isOpen,
  onClose,
  member,
  teamLicenseId,
}: RemoveMemberDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const queryClient = useQueryClient();

  const { mutate: removeMemberMutation, isPending } = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamLicenseId] });
      toast.success('Team member removed successfully');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRemove = () => {
    if (confirmText.toLowerCase() !== 'remove') {
      toast.error('Please type "remove" to confirm');
      return;
    }
    removeMemberMutation(member.id);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to remove{' '}
              <span className="font-semibold">{member.name || member.email}</span>{' '}
              from the team?
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm" role="alert">
              <p className="font-medium text-destructive">Warning:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This action cannot be undone</li>
                <li>The member will lose access to all team resources</li>
                <li>Their data and settings will be preserved</li>
                <li>You can re-invite them in the future if needed</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p>Type <span className="font-mono font-bold">remove</span> to confirm:</p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'remove' here"
                className="max-w-[200px]"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={confirmText.toLowerCase() !== 'remove' || isPending}
          >
            {isPending ? 'Removing...' : 'Remove Member'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}