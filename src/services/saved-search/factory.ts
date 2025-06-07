import type { SavedSearchService } from "@/core/savedSearch";
import { DefaultSavedSearchService } from "@/services/saved-search/defaultSavedSearch.service";

let serviceInstance: SavedSearchService | null = null;

export interface ApiSavedSearchServiceOptions {
  reset?: boolean;
}

export function getApiSavedSearchService(
  options: ApiSavedSearchServiceOptions = {},
): SavedSearchService {
  if (options.reset) {
    serviceInstance = null;
  }
  if (!serviceInstance) {
    serviceInstance = new DefaultSavedSearchService();
  }
  return serviceInstance;
}
