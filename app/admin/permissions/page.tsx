import { Metadata } from 'next';
import PermissionsManagementPageClient from './ClientPage';

export const metadata: Metadata = {
  title: 'Permission Management',
  description: 'Create and manage permissions for your application',
};

export default function PermissionsManagementPage() {
  return <PermissionsManagementPageClient />;
}
