import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDataExport } from '../use-data-export';
import { api } from '@/lib/api/axios';

vi.mock('@/lib/api/axios', () => ({ api: { get: vi.fn() } }));

const mockGet = api.get as unknown as ReturnType<typeof vi.fn>;

describe('useDataExport', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('requests export and returns download url', async () => {
    const blob = new Blob(['data'], { type: 'application/json' });
    mockGet.mockResolvedValueOnce({ data: blob });
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.requestExport();
    });
    expect(mockGet).toHaveBeenCalledWith('/gdpr/export', { responseType: 'blob' });
    expect(result.current.downloadUrl).toContain('blob:');
    expect(result.current.error).toBeNull();
  });

  it('handles error', async () => {
    mockGet.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useDataExport());
    await act(async () => {
      await result.current.requestExport();
    });
    expect(result.current.error).toBe('fail');
    expect(result.current.downloadUrl).toBeNull();
  });
});
