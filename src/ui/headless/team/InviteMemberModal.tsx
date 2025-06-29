import { useState } from 'react';
import { InviteMemberForm, InviteMemberFormRenderProps } from '@/ui/headless/team/InviteMemberForm';

export interface SeatUsage {
  used: number;
  total: number;
}

export interface InviteMemberModalRenderProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  seatUsage: SeatUsage;
  formProps: InviteMemberFormRenderProps;
}

export interface InviteMemberModalProps {
  teamId: string;
  seatUsage: SeatUsage;
  children: (props: InviteMemberModalRenderProps) => React.ReactNode;
}

export function InviteMemberModal({ teamId, seatUsage, children }: InviteMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <InviteMemberForm teamId={teamId} onInviteSent={() => setIsOpen(false)}>
      {(formProps) =>
        children({
          isOpen,
          open: () => setIsOpen(true),
          close: () => setIsOpen(false),
          seatUsage,
          formProps
        })
      }
    </InviteMemberForm>
  );
}
