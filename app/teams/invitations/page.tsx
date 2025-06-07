import { Metadata } from 'next';
import TeamInvitationsPageClient from '@/app/teams/invitations/ClientPage';

export const metadata: Metadata = {
  title: 'Team Invitations',
  description: 'Manage team invitations',
};

export default function TeamInvitationsPage() {
  return <TeamInvitationsPageClient />;
}
