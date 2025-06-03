import { permissionCacheService } from '@/services/permission/permission-cache.service';
import {
  createErrorFromUnknown,
  EntityConsistencyError,
  RelationshipHierarchyError,
  RelationshipConstraintError,
  PartialRelationshipError,
} from '@/core/common/errors';

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
    if (
      !relationship.parentType ||
      !relationship.parentId ||
      !relationship.childType ||
      !relationship.childId ||
      !relationship.relationshipType
    ) {
      throw new EntityConsistencyError('Missing relationship fields');
    }
    if (
      relationship.parentType === relationship.childType &&
      relationship.parentId === relationship.childId
    ) {
      throw new RelationshipHierarchyError('Parent and child cannot be identical');
    }

    try {
      const result = await this.db
        .from('resource_relationships')
        .insert({
          parent_type: relationship.parentType,
          parent_id: relationship.parentId,
          child_type: relationship.childType,
          child_id: relationship.childId,
          relationship_type: relationship.relationshipType,
          created_by: relationship.createdBy,
        })
        .select()
        .single();
      if (result.error) {
        throw new RelationshipConstraintError(result.error.message);
      }
      try {
        await permissionCacheService.clearResource(
          relationship.childType,
          relationship.childId,
        );
      } catch (e) {
        await this.db
          .from('resource_relationships')
          .delete()
          .match({
            parent_type: relationship.parentType,
            parent_id: relationship.parentId,
            child_type: relationship.childType,
            child_id: relationship.childId,
          });
        throw new PartialRelationshipError('Cache update failed');
      }
      return result;
    } catch (err) {
      throw createErrorFromUnknown(err);
    }
  }

  async getParentResources(resourceType: string, resourceId: string) {
    const { data, error } = await this.db
      .from('resource_relationships')
      .select('parent_type, parent_id, relationship_type')
      .eq('child_type', resourceType)
      .eq('child_id', resourceId);
    if (error) {
      throw new RelationshipHierarchyError(error.message);
    }
    return data || [];
  }

  async getChildResources(resourceType: string, resourceId: string) {
    const { data, error } = await this.db
      .from('resource_relationships')
      .select('child_type, child_id, relationship_type')
      .eq('parent_type', resourceType)
      .eq('parent_id', resourceId);
    if (error) {
      throw new RelationshipHierarchyError(error.message);
    }
    return data || [];
  }

  async deleteRelationship(
    parentType: string,
    parentId: string,
    childType: string,
    childId: string
  ) {
    const { data: existing } = await this.db
      .from('resource_relationships')
      .select('*')
      .match({
        parent_type: parentType,
        parent_id: parentId,
        child_type: childType,
        child_id: childId,
      })
      .maybeSingle();

    const result = await this.db
      .from('resource_relationships')
      .delete()
      .match({
        parent_type: parentType,
        parent_id: parentId,
        child_type: childType,
        child_id: childId,
      });

    if (result.error) {
      throw new RelationshipConstraintError(result.error.message);
    }

    try {
      await permissionCacheService.clearResource(childType, childId);
    } catch (e) {
      if (existing) {
        await this.db.from('resource_relationships').insert(existing);
      }
      throw new PartialRelationshipError('Cache update failed');
    }
    return result;
  }
}
