/**
 * Supabase SSO Data Provider Implementation
 *
 * This class implements the SsoDataProvider interface using Supabase
 * as the underlying storage mechanism.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SsoProvider, SsoProviderPayload } from '../../core/sso/models';

import type { ISsoDataProvider } from '@/core/sso/ISsoDataProvider';


export class SupabaseSsoProvider implements ISsoDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listProviders(organizationId: string): Promise<SsoProvider[]> {
    const { data, error } = await this.supabase
      .from('sso_providers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(this.mapRecordToProvider);
  }

  async upsertProvider(payload: SsoProviderPayload): Promise<SsoProvider> {
    const { data, error } = await this.supabase
      .from('sso_providers')
      .upsert(
        {
          organization_id: payload.organizationId,
          provider_type: payload.providerType,
          provider_name: payload.providerName,
          config: payload.config,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,provider_type,provider_name' }
      )
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to upsert SSO provider');
    }

    return this.mapRecordToProvider(data);
  }

  private mapRecordToProvider(record: any): SsoProvider {
    return {
      id: record.id,
      organizationId: record.organization_id,
      providerType: record.provider_type,
      providerName: record.provider_name,
      config: record.config || {},
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
