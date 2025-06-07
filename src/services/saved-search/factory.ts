import type { SavedSearchService } from "@/core/savedSearch"0;
import { DefaultSavedSearchService } from "@/src/services/saved-search/defaultSavedSearch.service"64;

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
