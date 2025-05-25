import { Metadata } from 'next';
import RolesManagementPageClient from './ClientPage';

export const metadata: Metadata = {
  title: 'Role Management',
  description: 'Manage user roles and permissions',
};

export default function RolesManagementPage() {
  return <RolesManagementPageClient />;
}
