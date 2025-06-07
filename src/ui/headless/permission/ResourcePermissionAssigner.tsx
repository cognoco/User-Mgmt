import { useState, useCallback, useEffect } from 'react';
import { Permission } from '@/core/permission/models';
import { ResourcePermissionResolver } from '@/lib/services/resourcePermissionResolver.service';
import { usePermissions } from '@/hooks/permission/usePermissions';
import useResourceHierarchy, { ResourceNode } from '@/hooks/resource/useResourceHierarchy';

export interface ResourcePermissionAssignerProps {
  userId: string;
  rootType: string;
  rootId: string;
  render: (props: {
    tree: ResourceNode | null;
    assign: (resourceType: string, resourceId: string, permission: Permission) => Promise<void>;
    revoke: (resourceType: string, resourceId: string, permission: Permission) => Promise<void>;
    getEffective: (resourceType: string, resourceId: string) => Promise<Permission[]>;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function ResourcePermissionAssigner({ userId, rootType, rootId, render }: ResourcePermissionAssignerProps) {
  const { assignResourcePermission, removeResourcePermission } = usePermissions();
  const { tree, refresh } = useResourceHierarchy(rootType, rootId);
  const [resolver] = useState(() => new ResourcePermissionResolver());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = useCallback(async (type: string, id: string, perm: Permission) => {
    setIsLoading(true);
    setError(null);
    try {
      await assignResourcePermission(userId, perm, type, id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'assign failed');
    } finally {
      setIsLoading(false);
    }
  }, [assignResourcePermission, userId, refresh]);

  const revoke = useCallback(async (type: string, id: string, perm: Permission) => {
    setIsLoading(true);
    setError(null);
    try {
      await removeResourcePermission(userId, perm, type, id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'revoke failed');
    } finally {
      setIsLoading(false);
    }
  }, [removeResourcePermission, userId, refresh]);

  const getEffective = useCallback((type: string, id: string) => {
    return resolver.getEffectivePermissions(userId, type, id) as Promise<Permission[]>;
  }, [resolver, userId]);

  return <>{render({ tree, assign, revoke, getEffective, isLoading, error })}</>;
}
export default ResourcePermissionAssigner;
