import { Metadata } from 'next';
import TeamDashboardPageClient from '@app/teams/ClientPage';

export const metadata: Metadata = {
  title: 'Team Dashboard',
  description: 'Manage your teams and team members',
};

export default function TeamDashboardPage() {
  return <TeamDashboardPageClient />;
}
