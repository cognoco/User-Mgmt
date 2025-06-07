/**
 * Supabase CSRF Provider Implementation
 *
 * Implements the ICsrfDataProvider interface using Supabase as the
 * persistence layer. Tokens are stored in a `csrf_tokens` table.
 */

import { randomBytes } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ICsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';
import type { CsrfToken, CsrfTokenQuery } from '@/core/csrf/models';
import type { PaginationMeta } from '@/lib/api/common/responseFormatter';

/** Default token expiration in milliseconds (24 hours) */
const DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000;

export class SupabaseCsrfProvider implements ICsrfDataProvider {
  private supabase: SupabaseClient;

  constructor(private supabaseUrl: string, private supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /** @inheritdoc */
  async generateToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  /** @inheritdoc */
  async createToken(): Promise<{ success: boolean; token?: CsrfToken; error?: string }> {
    const token = await this.generateToken();
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRATION_MS).toISOString();

    const { data, error } = await this.supabase
      .from('csrf_tokens')
      .insert({ token, expires_at: expiresAt })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create token' };
    }

    return { success: true, token: this.mapRecordToToken(data) };
  }

  /** @inheritdoc */
  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    const { data, error } = await this.supabase
      .from('csrf_tokens')
      .select('token, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      return { valid: false, error: error.message };
    }

    return { valid: !!data };
  }

  /** @inheritdoc */
  async revokeToken(token: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.from('csrf_tokens').delete().eq('token', token);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  /** @inheritdoc */
  async getToken(token: string): Promise<CsrfToken | null> {
    const { data, error } = await this.supabase
      .from('csrf_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapRecordToToken(data);
  }

  /** @inheritdoc */
  async listTokens(query: CsrfTokenQuery): Promise<{ tokens: CsrfToken[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = this.supabase.from('csrf_tokens').select('*', { count: 'exact' });

    if (query.userId) {
      dbQuery = dbQuery.eq('user_id', query.userId);
    }

    if (typeof query.valid === 'boolean') {
      const op = query.valid ? 'gt' : 'lte';
      dbQuery = dbQuery[op]('expires_at', new Date().toISOString());
    }

    const sortField = query.sortBy ?? 'expires_at';
    const ascending = (query.sortOrder ?? 'asc') === 'asc';
    dbQuery = dbQuery.order(sortField, { ascending }).range(from, to);

    const { data, error, count } = await dbQuery;

    if (error || !data) {
      return {
        tokens: [],
        pagination: {
          page,
          pageSize: limit,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const total = count ?? 0;
    return {
      tokens: data.map(this.mapRecordToToken),
      pagination: {
        page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: from + data.length < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /** @inheritdoc */
  async updateToken(token: string, data: Partial<CsrfToken>): Promise<{ success: boolean; token?: CsrfToken; error?: string }> {
    const update: Record<string, any> = {};
    if (data.expiresAt) {
      update.expires_at = data.expiresAt.toISOString();
    }

    const { data: updated, error } = await this.supabase
      .from('csrf_tokens')
      .update(update)
      .eq('token', token)
      .select()
      .maybeSingle();

    if (error || !updated) {
      return { success: false, error: error?.message || 'Failed to update token' };
    }

    return { success: true, token: this.mapRecordToToken(updated) };
  }

  /** @inheritdoc */
  async purgeExpiredTokens(): Promise<{ success: boolean; count: number; error?: string }> {
    const { data, error } = await this.supabase
      .from('csrf_tokens')
      .delete()
      .lte('expires_at', new Date().toISOString())
      .select('token');

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data ? data.length : 0 };
  }

  private mapRecordToToken(record: any): CsrfToken {
    return {
      token: record.token,
      expiresAt: record.expires_at ? new Date(record.expires_at) : undefined,
    };
  }
}

export default SupabaseCsrfProvider;
