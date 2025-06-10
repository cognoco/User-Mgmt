import type { ResourceRelationshipService } from '@/core/resourceRelationship/interfaces';
import type { IResourceRelationshipDataProvider } from '@/core/resourceRelationship/IResourceRelationshipDataProvider';
import type { CreateRelationshipPayload, ResourceRelationship } from '@/core/resourceRelationship/models';

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
