import {
  SavedSearchService,
  SavedSearchCreatePayload,
  SavedSearchUpdatePayload,
  SavedSearch,
} from "@/core/savedSearch";
import { getServiceSupabase } from "@/lib/database/supabase";

export class DefaultSavedSearchService implements SavedSearchService {
  async listSavedSearches(userId: string): Promise<SavedSearch[]> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return (data as SavedSearch[]) || [];
  }

  async createSavedSearch(
    payload: SavedSearchCreatePayload,
  ): Promise<SavedSearch> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        user_id: payload.userId,
        name: payload.name,
        description: payload.description ?? "",
        search_params: payload.searchParams,
        is_public: payload.isPublic ?? false,
      })
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || "Failed to create saved search");
    }
    return data as SavedSearch;
  }

  async getSavedSearch(
    id: string,
    userId: string,
  ): Promise<SavedSearch | null> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("id", id)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return (data as SavedSearch) ?? null;
  }

  async updateSavedSearch(
    id: string,
    userId: string,
    updates: SavedSearchUpdatePayload,
  ): Promise<SavedSearch> {
    const supabase = getServiceSupabase();
    const { data: existing, error: checkErr } = await supabase
      .from("saved_searches")
      .select("user_id")
      .eq("id", id)
      .single();
    if (checkErr || !existing) {
      throw new Error("Saved search not found");
    }
    if (existing.user_id !== userId) {
      throw new Error("You can only update your own saved searches");
    }
    const { data, error } = await supabase
      .from("saved_searches")
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && {
          description: updates.description,
        }),
        ...(updates.searchParams && { search_params: updates.searchParams }),
        ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || "Failed to update saved search");
    }
    return data as SavedSearch;
  }

  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    const supabase = getServiceSupabase();
    const { data: existing, error: checkErr } = await supabase
      .from("saved_searches")
      .select("user_id")
      .eq("id", id)
      .single();
    if (checkErr || !existing) {
      throw new Error("Saved search not found");
    }
    if (existing.user_id !== userId) {
      throw new Error("You can only delete your own saved searches");
    }
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  }
}
