/**
 * Supabase API Key Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiKey, ApiKeyCreatePayload, ApiKeyCreateResult } from '../../core/api-keys/models';
import { ApiKeyDataProvider } from './interfaces';
import { generateApiKey } from '../../lib/api-keys/api-key-utils';

export class SupabaseApiKeyProvider implements ApiKeyDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .eq('user_id', userId)
      .eq('is_revoked', false);

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch API keys');
    }

    return data.map(this.mapDbKey);
  }

  async createKey(userId: string, payload: ApiKeyCreatePayload): Promise<ApiKeyCreateResult> {
    const { key, hashedKey, prefix } = generateApiKey();
    const { data, error } = await this.supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name: payload.name,
        key_hash: hashedKey,
        prefix,
        scopes: payload.scopes,
        expires_at: payload.expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_revoked: false
      })
      .select('id, name, prefix, scopes, expires_at, created_at, is_revoked')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create API key' };
    }

    return {
      success: true,
      key: this.mapDbKey(data),
      plaintext: key
    };
  }

  async revokeKey(userId: string, keyId: string): Promise<{ success: boolean; key?: ApiKey; error?: string }> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', userId)
      .select('id, user_id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to revoke key' };
    }

    return { success: true, key: this.mapDbKey(data) };
  }

  private mapDbKey(data: any): ApiKey {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      prefix: data.prefix,
      scopes: data.scopes || [],
      expiresAt: data.expires_at,
      lastUsedAt: data.last_used_at,
      createdAt: data.created_at,
      isRevoked: data.is_revoked
    };
  }
}
