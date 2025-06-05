import type {
  SavedSearch,
  SavedSearchCreatePayload,
  SavedSearchUpdatePayload
} from './models';

/**
 * Data provider interface for saved search persistence.
 *
 * Implementations are responsible solely for database access and should
 * not contain business logic.
 */
export interface ISavedSearchDataProvider {
  /** List saved searches visible to the given user */
  listSavedSearches(userId: string): Promise<SavedSearch[]>;

  /** Persist a new saved search */
  createSavedSearch(payload: SavedSearchCreatePayload): Promise<SavedSearch>;

  /** Retrieve a saved search by id if accessible */
  getSavedSearch(id: string, userId: string): Promise<SavedSearch | null>;

  /** Update a saved search owned by the user */
  updateSavedSearch(
    id: string,
    userId: string,
    updates: SavedSearchUpdatePayload
  ): Promise<SavedSearch>;

  /** Delete a saved search owned by the user */
  deleteSavedSearch(id: string, userId: string): Promise<void>;
}
