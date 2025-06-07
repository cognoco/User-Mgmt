import { Metadata } from 'next';
import TeamManagementPageClient from '@app/teams/manage/ClientPage';

export const metadata: Metadata = {
  title: 'Team Management',
  description: 'Manage your team members and roles',
};

export default function TeamManagementPage() {
  return <TeamManagementPageClient />;
}
