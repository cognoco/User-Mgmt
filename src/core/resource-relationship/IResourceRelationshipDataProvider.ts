import type { ResourceRelationship, CreateRelationshipPayload } from '@/src/core/resource-relationship/models';

export interface IResourceRelationshipDataProvider {
  createRelationship(payload: CreateRelationshipPayload): Promise<ResourceRelationship>;
  getChildRelationships(parentType: string, parentId: string): Promise<ResourceRelationship[]>;
  getParentRelationships(childType: string, childId: string): Promise<ResourceRelationship[]>;
  removeRelationship(parentType: string, parentId: string, childType: string, childId: string): Promise<boolean>;
}
