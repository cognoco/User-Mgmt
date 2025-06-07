import type { ResourceRelationship, CreateRelationshipPayload } from '@/src/core/resource-relationship/models';

export interface ResourceRelationshipService {
  getChildResources(parentType: string, parentId: string): Promise<ResourceRelationship[]>;
  getParentResources(childType: string, childId: string): Promise<ResourceRelationship[]>;
  createRelationship(payload: CreateRelationshipPayload): Promise<ResourceRelationship>;
  removeRelationship(parentType: string, parentId: string, childType: string, childId: string): Promise<boolean>;
}
