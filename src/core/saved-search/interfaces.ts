import {
  SavedSearch,
  SavedSearchCreatePayload,
  SavedSearchUpdatePayload,
} from "@/core/saved-search/models";

export interface SavedSearchService {
  listSavedSearches(userId: string): Promise<SavedSearch[]>;
  createSavedSearch(data: SavedSearchCreatePayload): Promise<SavedSearch>;
  getSavedSearch(id: string, userId: string): Promise<SavedSearch | null>;
  updateSavedSearch(
    id: string,
    userId: string,
    updates: SavedSearchUpdatePayload,
  ): Promise<SavedSearch>;
  deleteSavedSearch(id: string, userId: string): Promise<void>;
}
