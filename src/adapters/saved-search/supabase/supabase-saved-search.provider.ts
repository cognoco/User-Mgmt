import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ISavedSearchDataProvider } from '@/core/saved-search/ISavedSearchDataProvider';
import type {
  SavedSearch,
  SavedSearchCreatePayload,
  SavedSearchUpdatePayload
} from '@/core/saved-search/models';

/**
 * Supabase implementation of {@link ISavedSearchDataProvider}.
 *
 * Provides CRUD operations for saved search records using Supabase
 * as the persistence layer.
 */
export class SupabaseSavedSearchProvider implements ISavedSearchDataProvider {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async listSavedSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(r => this.mapRecord(r));
  }

  async createSavedSearch(payload: SavedSearchCreatePayload): Promise<SavedSearch> {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .insert({
        user_id: payload.userId,
        name: payload.name,
        description: payload.description ?? '',
        search_params: payload.searchParams,
        is_public: payload.isPublic ?? false
      })
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Failed to create saved search');
    }
    return this.mapRecord(data);
  }

  async getSavedSearch(id: string, userId: string): Promise<SavedSearch | null> {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapRecord(data) : null;
  }

  async updateSavedSearch(
    id: string,
    userId: string,
    updates: SavedSearchUpdatePayload
  ): Promise<SavedSearch> {
    const { data: existing, error: checkErr } = await this.supabase
      .from('saved_searches')
      .select('user_id')
      .eq('id', id)
      .single();
    if (checkErr || !existing) throw new Error('Saved search not found');
    if (existing.user_id !== userId) {
      throw new Error('You can only update your own saved searches');
    }
    const { data, error } = await this.supabase
      .from('saved_searches')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.searchParams && { search_params: updates.searchParams }),
        ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message || 'Failed to update saved search');
    }
    return this.mapRecord(data);
  }

  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    const { data: existing, error: checkErr } = await this.supabase
      .from('saved_searches')
      .select('user_id')
      .eq('id', id)
      .single();
    if (checkErr || !existing) throw new Error('Saved search not found');
    if (existing.user_id !== userId) {
      throw new Error('You can only delete your own saved searches');
    }
    const { error } = await this.supabase
      .from('saved_searches')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  private mapRecord(record: any): SavedSearch {
    return {
      id: record.id,
      userId: record.user_id,
      name: record.name,
      description: record.description,
      searchParams: record.search_params,
      isPublic: record.is_public,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
}

export default SupabaseSavedSearchProvider;
