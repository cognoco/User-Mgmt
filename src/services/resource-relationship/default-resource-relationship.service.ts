import type { ResourceRelationshipService } from '@/core/resource-relationship/interfaces';
import type { IResourceRelationshipDataProvider } from '@/core/resource-relationship/IResourceRelationshipDataProvider';
import type { CreateRelationshipPayload, ResourceRelationship } from '@/core/resource-relationship/models';

export class DefaultResourceRelationshipService implements ResourceRelationshipService {
  constructor(private provider: IResourceRelationshipDataProvider) {}

  getChildResources(parentType: string, parentId: string): Promise<ResourceRelationship[]> {
    return this.provider.getChildRelationships(parentType, parentId);
  }

  getParentResources(childType: string, childId: string): Promise<ResourceRelationship[]> {
    return this.provider.getParentRelationships(childType, childId);
  }

  createRelationship(payload: CreateRelationshipPayload): Promise<ResourceRelationship> {
    return this.provider.createRelationship(payload);
  }

  removeRelationship(parentType: string, parentId: string, childType: string, childId: string): Promise<boolean> {
    return this.provider.removeRelationship(parentType, parentId, childType, childId);
  }
}
