import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IResourceRelationshipDataProvider } from '@/core/resourceRelationship/IResourceRelationshipDataProvider';
import type { ResourceRelationship, CreateRelationshipPayload } from '@/core/resourceRelationship/models';

/**
 * Supabase implementation of {@link IResourceRelationshipDataProvider}.
 * Handles hierarchical resource relationships stored in the
 * `resource_relationships` table.
 */
export class SupabaseResourceRelationshipProvider implements IResourceRelationshipDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private map(row: any): ResourceRelationship {
    return {
      id: row.id,
      parentType: row.parent_type,
      parentId: row.parent_id,
      childType: row.child_type,
      childId: row.child_id,
      relationshipType: row.relationship_type,
    };
  }

  async createRelationship(payload: CreateRelationshipPayload): Promise<ResourceRelationship> {
    const { data, error } = await this.supabase
      .from('resource_relationships')
      .insert({
        parent_type: payload.parentType,
        parent_id: payload.parentId,
        child_type: payload.childType,
        child_id: payload.childId,
        relationship_type: payload.relationshipType,
        created_by: payload.createdBy,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'failed to create relationship');
    }
    return this.map(data);
  }

  async getChildRelationships(parentType: string, parentId: string): Promise<ResourceRelationship[]> {
    const { data, error } = await this.supabase
      .from('resource_relationships')
      .select('*')
      .eq('parent_type', parentType)
      .eq('parent_id', parentId);
    if (error || !data) return [];
    return data.map(r => this.map(r));
  }

  async getParentRelationships(childType: string, childId: string): Promise<ResourceRelationship[]> {
    const { data, error } = await this.supabase
      .from('resource_relationships')
      .select('*')
      .eq('child_type', childType)
      .eq('child_id', childId);
    if (error || !data) return [];
    return data.map(r => this.map(r));
  }

  async removeRelationship(
    parentType: string,
    parentId: string,
    childType: string,
    childId: string,
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('resource_relationships')
      .delete()
      .eq('parent_type', parentType)
      .eq('parent_id', parentId)
      .eq('child_type', childType)
      .eq('child_id', childId);
    return !error;
  }
}

export default SupabaseResourceRelationshipProvider;
