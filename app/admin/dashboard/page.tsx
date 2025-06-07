import { Metadata } from 'next';
import { AdminDashboard } from '@/ui/styled/admin/AdminDashboard';
import { Button } from '@/ui/primitives/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your organization',
};

export default function AdminDashboardPage(): JSX.Element {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/team">
              Manage Team
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/settings">
              Organization Settings
            </Link>
          </Button>
        </div>
      </div>
      
      <AdminDashboard />
    </div>
  );
} 