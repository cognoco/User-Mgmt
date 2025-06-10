export interface ResourceRelationship {
  id: string;
  parentType: string;
  parentId: string;
  childType: string;
  childId: string;
  relationshipType: string;
}

export interface CreateRelationshipPayload {
  parentType: string;
  parentId: string;
  childType: string;
  childId: string;
  relationshipType: string;
  createdBy: string;
}
