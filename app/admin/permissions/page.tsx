'use client';
import { Metadata } from 'next';
import RoleManagementPanel from './RoleManagementPanel';
import UserRoleAssignmentPanel from './UserRoleAssignmentPanel';
import ResourcePermissionPanel from './ResourcePermissionPanel';
import AuditLogViewer from './AuditLogViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';

export const metadata: Metadata = {
  title: 'Permission Management',
  description: 'Manage roles and permissions',
};

export default function PermissionDashboardPage() {
  return (
    <div className="container py-6 space-y-8">
      <h1 className="text-3xl font-bold">Permission Management</h1>
      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
          <TabsTrigger value="resources">Resource Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="roles">
          <RoleManagementPanel />
        </TabsContent>
        <TabsContent value="users">
          <UserRoleAssignmentPanel />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcePermissionPanel />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
