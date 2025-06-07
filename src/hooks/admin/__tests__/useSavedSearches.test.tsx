// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSavedSearches } from '@/src/hooks/admin/useSavedSearches';
import { useApi } from '@/hooks/core/useApi';

vi.mock('@/hooks/core/useApi');

describe('useSavedSearches', () => {
  const fetchApi = vi.fn();
  const apiPost = vi.fn();
  const apiPatch = vi.fn();
  const apiDelete = vi.fn();

  beforeEach(() => {
    vi.mocked(useApi).mockReturnValue({
      isLoading: false,
      error: null,
      fetchApi,
      apiPost,
      apiPatch,
      apiDelete,
    });
    fetchApi.mockResolvedValue({ savedSearches: [] });
  });

  it('fetches searches', async () => {
    const { result } = renderHook(() => useSavedSearches());
    await act(async () => {
      await result.current.fetchSavedSearches();
    });
    expect(fetchApi).toHaveBeenCalled();
  });

  it('creates search', async () => {
    const { result } = renderHook(() => useSavedSearches());
    await act(async () => {
      await result.current.createSavedSearch({ name: 'Test', searchParams: {} });
    });
    expect(apiPost).toHaveBeenCalled();
  });

  it('updates search', async () => {
    const { result } = renderHook(() => useSavedSearches());
    await act(async () => {
      await result.current.updateSavedSearch('1', { name: 'A' });
    });
    expect(apiPatch).toHaveBeenCalled();
  });

  it('deletes search', async () => {
    const { result } = renderHook(() => useSavedSearches());
    await act(async () => {
      await result.current.deleteSavedSearch('1');
    });
    expect(apiDelete).toHaveBeenCalled();
  });
});
