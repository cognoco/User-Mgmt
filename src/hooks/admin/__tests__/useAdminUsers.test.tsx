// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useApi } from '@/hooks/core/useApi';
import { useRealtimeUserSearch } from '@/hooks/admin/useRealtimeUserSearch';

vi.mock('@/hooks/core/useApi');
vi.mock('../useRealtimeUserSearch');

describe('useAdminUsers', () => {
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
    vi.mocked(useRealtimeUserSearch).mockReturnValue({ isConnected: true });
    fetchApi.mockResolvedValue({ users: [{ id: '1' }], pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 } });
  });

  it('fetches users', async () => {
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.searchUsers({ query: 'a' });
    });
    expect(fetchApi).toHaveBeenCalled();
    expect(result.current.users.length).toBe(1);
    expect(result.current.pagination?.totalCount).toBe(1);
  });

  it('refreshSearch repeats last query', async () => {
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.searchUsers({ query: 'a' });
    });
    fetchApi.mockClear();
    await act(async () => {
      await result.current.refreshSearch();
    });
    expect(fetchApi).toHaveBeenCalled();
  });
});
