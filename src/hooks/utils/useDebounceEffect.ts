import { useEffect, DependencyList } from 'react';

/**
 * A custom React hook that debounces an effect.
 * It waits for a specified delay after dependencies change before executing the effect.
 * 
 * @param effect The effect callback function to execute.
 * @param deps An array of dependencies for the effect.
 * @param delay The debounce delay in milliseconds.
 */
export function useDebounceEffect(
  effect: () => void | (() => void), 
  deps: DependencyList, 
  delay: number
) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    // Cleanup function to clear the timeout if dependencies change or component unmounts
    return () => clearTimeout(handler);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    // We need to include all the dependencies here, including the delay
  }, [...deps, delay]);
} 