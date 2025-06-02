import { getServiceSupabase } from '@/lib/database/supabase';
import type { Permission } from '@/core/permission/models';

export interface ResourceRef {
  resourceType: string;
  resourceId: string;
}

export class ResourcePermissionResolver {
  constructor(private supabase = getServiceSupabase()) {}

  async getResourceAncestors(resourceType: string, resourceId: string): Promise<ResourceRef[]> {
    const ancestors: ResourceRef[] = [];
    let currentType = resourceType;
    let currentId = resourceId;

    while (true) {
      const { data, error } = await this.supabase
        .from('resource_relationships')
        .select('parent_type, parent_id')
        .eq('child_type', currentType)
        .eq('child_id', currentId)
        .single();

      if (error || !data) break;

      ancestors.push({ resourceType: data.parent_type, resourceId: data.parent_id });
      currentType = data.parent_type;
      currentId = data.parent_id;
    }

    return ancestors;
  }

  async getEffectivePermissions(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<Permission[]> {
    const permissions = new Set<Permission>();

    const fetchPerms = async (type: string, id: string) => {
      const { data } = await this.supabase
        .from('resource_permissions')
        .select('permission_name')
        .eq('user_id', userId)
        .eq('resource_type', type)
        .eq('resource_id', id);
      (data || []).forEach((row: any) => permissions.add(row.permission_name as Permission));
    };

    await fetchPerms(resourceType, resourceId);

    const ancestors = await this.getResourceAncestors(resourceType, resourceId);
    for (const ancestor of ancestors) {
      await fetchPerms(ancestor.resourceType, ancestor.resourceId);
    }

    return Array.from(permissions);
  }
}
