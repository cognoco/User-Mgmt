import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile } from '@/lib/utils/responsive';

function mockMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('responsive utils', () => {
  it('useMediaQuery returns true when query matches', () => {
    window.matchMedia = mockMatchMedia(true) as any;
    const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(result.current).toBe(true);
  });

  it('useIsMobile uses max-width md breakpoint', () => {
    window.matchMedia = mockMatchMedia(true) as any;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
