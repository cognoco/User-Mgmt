import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IOrganizationDataProvider } from '@/core/organization/IOrganizationDataProvider';
import type {
  Organization,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  OrganizationResult,
  OrganizationMember,
  OrganizationMemberResult
} from '@/core/organization/models';

export class SupabaseOrganizationProvider implements IOrganizationDataProvider {
  private supabase: SupabaseClient;

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  private map(record: any): Organization {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }

  async createOrganization(ownerId: string, data: OrganizationCreatePayload): Promise<OrganizationResult> {
    const { data: org, error } = await this.supabase
      .from('organizations')
      .insert({ name: data.name, description: data.description })
      .select()
      .single();
    if (error || !org) {
      return { success: false, error: error?.message || 'Failed to create organization' };
    }
    await this.supabase
      .from('organization_members')
      .insert({ organization_id: org.id, user_id: ownerId, role: 'owner', is_owner: true });
    return { success: true, organization: this.map(org) };
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const { data, error } = await this.supabase.from('organizations').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.map(data);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('organizations(*)')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map((r: any) => this.map(r.organizations));
  }

  async updateOrganization(id: string, data: OrganizationUpdatePayload): Promise<OrganizationResult> {
    const { data: org, error } = await this.supabase
      .from('organizations')
      .update({ name: data.name, description: data.description })
      .eq('id', id)
      .select()
      .single();
    if (error || !org) {
      return { success: false, error: error?.message || 'Failed to update organization' };
    }
    return { success: true, organization: this.map(org) };
  }

  async deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.from('organizations').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId);
    if (error || !data) return [];
    return data.map((r: any) => ({
      organizationId: r.organization_id,
      userId: r.user_id,
      role: r.role,
    }));
  }

  async addMember(orgId: string, userId: string, role: string): Promise<OrganizationMemberResult> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .insert({ organization_id: orgId, user_id: userId, role })
      .select()
      .single();
    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to add member' };
    }
    return {
      success: true,
      member: {
        organizationId: data.organization_id,
        userId: data.user_id,
        role: data.role,
      },
    };
  }
}
