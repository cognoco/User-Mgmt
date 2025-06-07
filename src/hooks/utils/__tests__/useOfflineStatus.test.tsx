import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useOfflineStatus from '@/src/hooks/utils/useOfflineStatus'106;
import useOfflineDetection from '@/src/hooks/utils/useOfflineDetection'159;

vi.mock('../useOfflineDetection', () => ({
  __esModule: true,
  default: vi.fn()
}));

const mockedDetection = useOfflineDetection as unknown as vi.Mock;

describe('useOfflineStatus', () => {
  it('returns offline state', () => {
    mockedDetection.mockReturnValue(true);
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current.isOffline).toBe(true);
    expect(result.current.isReconnecting).toBe(false);
  });

  it('returns reconnecting when queue pending', () => {
    mockedDetection.mockReturnValue(false);
    const { result } = renderHook(() => useOfflineStatus(3));
    expect(result.current.isOffline).toBe(false);
    expect(result.current.isReconnecting).toBe(true);
  });
});
