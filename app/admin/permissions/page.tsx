'use client';
import { Metadata } from 'next';
import RoleManagementPanel from '@/app/admin/permissions/RoleManagementPanel'49;
import UserRoleAssignmentPanel from '@/app/admin/permissions/UserRoleAssignmentPanel'107;
import ResourcePermissionPanel from '@/app/admin/permissions/ResourcePermissionPanel'173;
import AuditLogViewer from '@/app/admin/permissions/AuditLogViewer'239;
import PermissionAuditDashboard from '@/app/admin/permissions/PermissionAuditDashboard'287;
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
          <div className="space-y-6">
            <AuditLogViewer />
            <PermissionAuditDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
