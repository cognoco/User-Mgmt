import { useState, useEffect } from 'react';

/**
 * Standardized responsive breakpoints for the application.
 * These match tailwind's default breakpoints for consistency.
 */
export const breakpoints = {
  sm: 640,   // Small devices (phones, 640px and up)
  md: 768,   // Medium devices (tablets, 768px and up)
  lg: 1024,  // Large devices (desktops, 1024px and up)
  xl: 1280,  // Extra large devices (large desktops, 1280px and up)
  '2xl': 1536 // 2XL screens (ultra wide desktops, 1536px and up)
};

/**
 * Utility to create media query strings for CSS-in-JS solutions
 * @param breakpoint The breakpoint to target
 * @param type The type of media query ('min' or 'max')
 * @returns A media query string
 */
export const mediaQuery = (breakpoint: keyof typeof breakpoints, type: 'min' | 'max' = 'min') => {
  const pixelValue = breakpoints[breakpoint];
  return `@media (${type}-width: ${pixelValue}px)`;
};

/**
 * React hook to check if the current viewport matches a media query
 * @param query The media query to check
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }
    
    const mediaQuery = window.matchMedia(query);
    // Set initial value
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Shorthand hooks for common responsive checks
 */
export const useIsMobile = () => useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
export const useIsTablet = () => useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${breakpoints.lg}px)`); 