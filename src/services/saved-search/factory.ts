import type { SavedSearchService } from "@/core/saved-search";
import { DefaultSavedSearchService } from "./default-saved-search.service";

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
