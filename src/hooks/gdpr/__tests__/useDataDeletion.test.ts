import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataDeletion } from '@/src/hooks/gdpr/useDataDeletion'123;
import { api } from '@/lib/api/axios';

vi.mock('@/lib/api/axios', () => ({ api: { post: vi.fn() } }));

const mockPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe('useDataDeletion', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('requests deletion successfully', async () => {
    mockPost.mockResolvedValueOnce({});
    const { result } = renderHook(() => useDataDeletion());
    await act(async () => {
      await result.current.requestDeletion();
    });
    expect(mockPost).toHaveBeenCalledWith('/gdpr/delete');
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    mockPost.mockRejectedValueOnce(new Error('oops'));
    const { result } = renderHook(() => useDataDeletion());
    await act(async () => {
      await result.current.requestDeletion();
    });
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('oops');
  });
});
