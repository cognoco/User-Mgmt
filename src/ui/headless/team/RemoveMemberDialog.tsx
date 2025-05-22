import { useState } from 'react';
import { useTeamMembers } from '@/hooks/team/useTeamMembers';

export interface RemoveMemberDialogRenderProps {
  confirmText: string;
  setConfirmText: (v: string) => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  isProcessing: boolean;
  isOpen: boolean;
  memberId: string;
}

export interface RemoveMemberDialogProps {
  teamId: string;
  memberId: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onRemoved?: () => void;
  children: (props: RemoveMemberDialogRenderProps) => React.ReactNode;
}

export function RemoveMemberDialog({
  teamId,
  memberId,
  isOpen: controlled,
  onOpenChange,
  onRemoved,
  children
}: RemoveMemberDialogProps) {
  const { removeTeamMember, isLoading } = useTeamMembers(teamId);
  const [confirmText, setConfirmText] = useState('');
  const [internal, setInternal] = useState(false);
  const open = controlled ?? internal;
  const setOpen = onOpenChange ?? setInternal;

  const confirm = async () => {
    if (confirmText.toLowerCase() !== 'remove') return;
    await removeTeamMember(memberId);
    setOpen(false);
    onRemoved?.();
  };

  return children({
    confirmText,
    setConfirmText,
    confirm,
    cancel: () => setOpen(false),
    isProcessing: isLoading,
    isOpen: open,
    memberId
  });
}
