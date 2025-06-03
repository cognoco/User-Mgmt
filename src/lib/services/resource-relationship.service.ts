import { permissionCacheService } from '@/services/permission/permission-cache.service';

export class ResourceRelationshipService {
  constructor(private db: any) {}

  async createRelationship(relationship: {
    parentType: string;
    parentId: string;
    childType: string;
    childId: string;
    relationshipType: string;
    createdBy?: string;
  }) {
    const result = await this.db
      .from('resource_relationships')
      .insert({
        parent_type: relationship.parentType,
        parent_id: relationship.parentId,
        child_type: relationship.childType,
        child_id: relationship.childId,
        relationship_type: relationship.relationshipType,
        created_by: relationship.createdBy
      })
      .select()
      .single();
    await permissionCacheService.clearResource(relationship.childType, relationship.childId);
    return result;
  }

  async getParentResources(resourceType: string, resourceId: string) {
    const { data, error } = await this.db
      .from('resource_relationships')
      .select('parent_type, parent_id, relationship_type')
      .eq('child_type', resourceType)
      .eq('child_id', resourceId);
    if (error) throw error;
    return data || [];
  }

  async getChildResources(resourceType: string, resourceId: string) {
    const { data, error } = await this.db
      .from('resource_relationships')
      .select('child_type, child_id, relationship_type')
      .eq('parent_type', resourceType)
      .eq('parent_id', resourceId);
    if (error) throw error;
    return data || [];
  }

  async deleteRelationship(
    parentType: string,
    parentId: string,
    childType: string,
    childId: string
  ) {
    const result = await this.db
      .from('resource_relationships')
      .delete()
      .match({
        parent_type: parentType,
        parent_id: parentId,
        child_type: childType,
        child_id: childId
      });
    await permissionCacheService.clearResource(childType, childId);
    return result;
  }
}
