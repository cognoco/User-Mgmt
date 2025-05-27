import { useState } from 'react';
import { useApi } from '@/hooks/core/useApi';

interface SavedSearch {
  id: string;
  name: string;
  description: string;
  searchParams: Record<string, any>;
  isPublic: boolean;
  userId: string;
  createdAt: string;
}

interface CreateSavedSearchParams {
  name: string;
  description?: string;
  searchParams: Record<string, any>;
  isPublic?: boolean;
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const { isLoading, error, fetchApi, apiPost, apiPatch, apiDelete } = useApi();

  const fetchSavedSearches = async () => {
    const result = await fetchApi<{ savedSearches: SavedSearch[] }>('/api/admin/saved-searches');
    if (result) {
      setSavedSearches(result.savedSearches);
    }
  };

  const createSavedSearch = async (params: CreateSavedSearchParams) => {
    return apiPost<{ savedSearch: SavedSearch }>('/api/admin/saved-searches', params);
  };

  const updateSavedSearch = async (
    id: string,
    params: Partial<Omit<CreateSavedSearchParams, 'searchParams'>>
  ) => {
    return apiPatch<{ savedSearch: SavedSearch }>(`/api/admin/saved-searches/${id}`, params);
  };

  const deleteSavedSearch = async (id: string) => {
    return apiDelete(`/api/admin/saved-searches/${id}`);
  };

  return {
    savedSearches,
    isLoading,
    error,
    fetchSavedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
  };
}
