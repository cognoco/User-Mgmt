/**
 * Supabase API Key Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ApiKey,
  ApiKeyCreatePayload,
  ApiKeyCreateResult,
  ApiKeyQuery,
  ApiKeyListResult
} from '@/core/api-keys/models';
import type { IApiKeyDataProvider } from '@/core/api-keys/IApiKeyDataProvider';
import { generateApiKey } from '../../lib/api-keys/api-key-utils';

export class SupabaseApiKeyProvider implements IApiKeyDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Legacy method kept for backward compatibility. Wraps {@link listApiKeys}.
   */
  async listKeys(userId: string): Promise<ApiKey[]> {
    const result = await this.listApiKeys(userId);
    return result.apiKeys;
  }

  /**
   * List API keys for a user with optional filtering and pagination.
   */
  async listApiKeys(userId: string, query: ApiKeyQuery = {}): Promise<ApiKeyListResult> {
    let req = this.supabase
      .from('api_keys')
      .select('id, user_id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked', { count: 'exact' })
      .eq('user_id', userId);

    if (query.isRevoked !== undefined) {
      req = req.eq('is_revoked', query.isRevoked);
    }
    if (query.search) {
      req = req.ilike('name', `%${query.search}%`);
    }
    if (query.expiresBefore) {
      req = req.lt('expires_at', query.expiresBefore);
    }
    if (query.sortBy) {
      const column =
        query.sortBy === 'createdAt'
          ? 'created_at'
          : query.sortBy === 'expiresAt'
            ? 'expires_at'
            : 'name';
      req = req.order(column, { ascending: query.sortDirection !== 'desc' });
    }

    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    req = req.range(from, to);

    const { data, error, count } = await req;

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch API keys');
    }

    const apiKeys = data.map(this.mapDbKey);
    const total = count ?? apiKeys.length;
    const totalPages = Math.ceil(total / limit);

    return { apiKeys, total, page, limit, totalPages };
  }

  /**
   * Legacy wrapper around {@link createApiKey} for backwards compatibility.
   */
  async createKey(userId: string, payload: ApiKeyCreatePayload): Promise<ApiKeyCreateResult> {
    return this.createApiKey(userId, payload);
  }

  async createApiKey(userId: string, payload: ApiKeyCreatePayload): Promise<ApiKeyCreateResult> {
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
      .select('id, user_id, name, prefix, scopes, expires_at, created_at, is_revoked')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create API key' };
    }

    return { success: true, key: this.mapDbKey(data), plaintext: key };
  }

  /**
   * Legacy wrapper around {@link revokeApiKey} for backwards compatibility.
   */
  async revokeKey(userId: string, keyId: string): Promise<{ success: boolean; key?: ApiKey; error?: string }> {
    return this.revokeApiKey(userId, keyId);
  }

  async revokeApiKey(userId: string, keyId: string): Promise<{ success: boolean; key?: ApiKey; error?: string }> {
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

  async getApiKey(userId: string, keyId: string): Promise<ApiKey | null> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('id, user_id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapDbKey(data);
  }

  async regenerateApiKey(userId: string, keyId: string): Promise<{ success: boolean; key?: ApiKey; plaintext?: string; error?: string }> {
    const { key, hashedKey, prefix } = generateApiKey();
    const { data, error } = await this.supabase
      .from('api_keys')
      .update({ key_hash: hashedKey, prefix, updated_at: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', userId)
      .select('id, user_id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to regenerate key' };
    }

    return { success: true, key: this.mapDbKey(data), plaintext: key };
  }

  async updateApiKey(
    userId: string,
    keyId: string,
    update: Partial<ApiKeyCreatePayload>
  ): Promise<{ success: boolean; key?: ApiKey; error?: string }> {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (update.name !== undefined) updates.name = update.name;
    if (update.scopes !== undefined) updates.scopes = update.scopes;
    if (update.expiresAt !== undefined) updates.expires_at = update.expiresAt;

    const { data, error } = await this.supabase
      .from('api_keys')
      .update(updates)
      .eq('id', keyId)
      .eq('user_id', userId)
      .select('id, user_id, name, prefix, scopes, expires_at, last_used_at, created_at, is_revoked')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to update API key' };
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
