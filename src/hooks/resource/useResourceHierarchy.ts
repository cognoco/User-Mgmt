import { useState, useCallback, useEffect } from 'react';
import { UserManagementConfiguration } from '@/core/config';
import type { ResourceRelationshipService } from '@/core/resourceRelationship/interfaces';

export interface ResourceNode {
  id: string;
  type: string;
  children: ResourceNode[];
}

export function useResourceHierarchy(rootType: string, rootId: string) {
  const service = UserManagementConfiguration.getServiceProvider<ResourceRelationshipService>('resourceRelationshipService');
  const [root, setRoot] = useState<ResourceNode | null>(null);

  const buildTree = useCallback(async (type: string, id: string): Promise<ResourceNode> => {
    if (!service) throw new Error('resourceRelationshipService not available');
    const children = await service.getChildResources(type, id);
    const childNodes = await Promise.all(
      children.map((c) => buildTree(c.childType, c.childId)),
    );
    return { id, type, children: childNodes };
  }, [service]);

  const refresh = useCallback(async () => {
    if (!service) return;
    setRoot(await buildTree(rootType, rootId));
  }, [service, buildTree, rootType, rootId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tree: root, refresh };
}
export default useResourceHierarchy;
