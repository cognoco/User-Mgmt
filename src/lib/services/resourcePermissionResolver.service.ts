import { getServiceSupabase } from '@/lib/database/supabase';
import { createResourceRelationshipService } from '@/services/resource-relationship/factory';
import { permissionCacheService } from '@/services/permission/permissionCache.service';

export class ResourcePermissionResolver {
  private relationshipService;
  private db;

  constructor() {
    this.db = getServiceSupabase();
    this.relationshipService = createResourceRelationshipService(this.db);
  }

  /**
   * Get all ancestors for a resource (recursive parents)
   */
  async getResourceAncestors(resourceType: string, resourceId: string, maxDepth = 10): Promise<any[]> {
    const cacheKey = `${resourceType}:${resourceId}`;
    return permissionCacheService.resourcePermissions.getOrCreate(cacheKey, async () => {
      const ancestors = [] as any[];
      let currentType = resourceType;
      let currentId = resourceId;
      let depth = 0;

      while (depth < maxDepth) {
        const parents = await this.relationshipService.getParentResources(currentType, currentId);
        if (!parents || parents.length === 0) break;

        const parent = parents[0];
        ancestors.push({
          type: parent.parent_type,
          id: parent.parent_id,
          relationshipType: parent.relationship_type
        });

        currentType = parent.parent_type;
        currentId = parent.parent_id;
        depth++;
      }

      return ancestors;
    });
  }

  /**
   * Get all permissions for a user on a resource, including inherited ones
   */
  async getEffectivePermissions(userId: string, resourceType: string, resourceId: string): Promise<string[]> {
    // Get direct permissions on the resource
    const { data: directPermissions } = await this.db
      .from('resource_permissions')
      .select('permission')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);

    const directPerms = directPermissions?.map(p => p.permission) || [];

    // Get ancestors for inheritance
    const ancestors = await this.getResourceAncestors(resourceType, resourceId);

    // No ancestors, just return direct permissions
    if (ancestors.length === 0) return directPerms;

    // Get inherited permissions from ancestors
    const inheritedPermsPromises = ancestors.map(ancestor => {
      return this.db
        .from('resource_permissions')
        .select('permission')
        .eq('user_id', userId)
        .eq('resource_type', ancestor.type)
        .eq('resource_id', ancestor.id);
    });

    const inheritedPermsResults = await Promise.all(inheritedPermsPromises);

    // Combine all permissions, with direct permissions taking precedence
    const allPerms = new Set(directPerms);
    inheritedPermsResults.forEach(result => {
      if (result.data) {
        result.data.forEach(p => allPerms.add(p.permission));
      }
    });

    return Array.from(allPerms);
  }

  /**
   * Check if user has a specific permission on a resource
   */
  async hasPermission(userId: string, permission: string, resourceType: string, resourceId: string): Promise<boolean> {
    // First check for direct permission (optimization)
    const { data: directPerm } = await this.db
      .from('resource_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('permission', permission)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .maybeSingle();

    if (directPerm) return true;

    // If not found directly, get all effective permissions and check
    const effectivePermissions = await this.getEffectivePermissions(userId, resourceType, resourceId);
    return effectivePermissions.includes(permission);
  }
}

export function createResourcePermissionResolver() {
  return new ResourcePermissionResolver();
}
