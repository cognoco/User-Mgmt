import { useEffect, useState } from 'react';
import { useRoleHierarchy } from '@/hooks/admin/useRoleHierarchy';
import PermissionInheritanceVisualizer from './PermissionInheritanceVisualizer';

interface RoleNode {
  id: string;
  name: string;
  parentRoleId?: string | null;
}

export function RoleHierarchyTree({ rootRoleId = 'root' }: { rootRoleId?: string }) {
  const { fetchHierarchy } = useRoleHierarchy();
  const [roles, setRoles] = useState<RoleNode[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchHierarchy(rootRoleId);
      if (!data) return;
      const allRoles: RoleNode[] = [{ id: rootRoleId, name: rootRoleId }, ...data.descendants];
      setRoles(allRoles);
    }
    load();
  }, [rootRoleId, fetchHierarchy]);

  const renderRole = (role: RoleNode) => (
    <li key={role.id} className="mt-2">
      <PermissionInheritanceVisualizer roleId={role.id} title={role.name} />
      {roles.some(r => r.parentRoleId === role.id) && (
        <ul className="ml-4">
          {roles.filter(r => r.parentRoleId === role.id).map(renderRole)}
        </ul>
      )}
    </li>
  );

  const roots = roles.filter(r => r.parentRoleId === null || r.id === rootRoleId);

  return <ul className="list-none p-0">{roots.map(renderRole)}</ul>;
}
export default RoleHierarchyTree;
