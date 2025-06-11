'use client';
import { useEffect } from 'react';
import RoleHierarchyTree from '@/ui/styled/permission/RoleHierarchyTree';
import { useRoleHierarchy } from '@/hooks/permission/useRoleHierarchy';

export default function RoleHierarchyPage() {
  const { hierarchy, isLoading, error, fetchHierarchy, moveRole } = useRoleHierarchy();

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Role Hierarchy Management</h1>
        <div className="animate-pulse">Loading role hierarchy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Role Hierarchy Management</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Role Hierarchy Management</h1>
      <RoleHierarchyTree tree={hierarchy} onMove={moveRole} />
    </div>
  );
}
