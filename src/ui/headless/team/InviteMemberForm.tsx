import { useState, FormEvent } from 'react';
import { z } from 'zod';
import { useTeamInvite } from '@/hooks/team/useTeamInvite';

export interface InviteMemberFormRenderProps {
  email: string;
  role: string;
  setEmail: (v: string) => void;
  setRole: (v: string) => void;
  handleSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface InviteMemberFormProps {
  teamId: string;
  onInviteSent?: () => void;
  children: (props: InviteMemberFormRenderProps) => React.ReactNode;
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.string().min(1)
});

export function InviteMemberForm({ teamId, onInviteSent, children }: InviteMemberFormProps) {
  const { inviteToTeam, isLoading, error, successMessage } = useTeamInvite();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      inviteSchema.parse({ email, role });
      await inviteToTeam(teamId, { email, role });
      setEmail('');
      setRole('member');
      onInviteSent?.();
    } catch (err) {
      // ignore, hook will expose error
    } finally {
      setSubmitting(false);
    }
  };

  return children({
    email,
    role,
    setEmail,
    setRole,
    handleSubmit,
    isSubmitting: isLoading || submitting,
    error,
    successMessage
  });
}
