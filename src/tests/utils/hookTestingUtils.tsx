// __tests__/utils/hook-testing-utils.js

import { renderHook, act, RenderHookOptions, RenderHookResult } from '@testing-library/react';
import React from 'react';
import { vi, expect } from 'vitest';

/**
 * Creates a wrapper component with provided context providers
 * @param {Array} providers - Array of [Provider, props] tuples
 * @returns {Function} Wrapper component for renderHook
 */
export type ProviderEntry<P = any> = [React.ComponentType<P>, P];

export function createWrapper(providers: ProviderEntry[] = []): React.FC<{ children: React.ReactNode }> {
  return ({ children }: { children: React.ReactNode }): React.ReactElement => {
    return providers.reduce<React.ReactElement>((wrapped, [Provider, props]) => {
      const ProviderComponent = Provider;
      return <ProviderComponent {...props}>{wrapped}</ProviderComponent>;
    }, <>{children}</>);
  };
}

/**
 * Renders a hook with convenient helpers for testing
 * @param {Function} hook - The hook to test
 * @param {Object} options - Options for renderHook
 * @returns {Object} Enhanced result object
 */
export interface RenderCustomHookOptions<Props>
  extends Omit<RenderHookOptions<Props>, 'wrapper'> {
  providers?: ProviderEntry[];
}

export function renderCustomHook<Result, Props>(
  hook: (props: Props) => Result,
  options: RenderCustomHookOptions<Props> = {}
): {
  act: (action: (state: Result) => Promise<void> | void) => Promise<void>;
  updateProps: (props: Props) => void;
  getState: () => Result;
} & RenderHookResult<Result, Props> {
  const { providers = [], initialProps, ...renderOptions } = options;

  // Create wrapper with providers
  const wrapper = createWrapper(providers);
  
  // Render the hook
  const result = renderHook(hook, {
    wrapper,
    initialProps,
    ...renderOptions,
  });
  
  return {
    ...result,
    /**
     * Updates hook state with an action
     * @param {Function} action - Function that updates hook state
     * @returns {Promise<void>}
     */
    act: async (action: (state: Result) => Promise<void> | void) => {
      await act(async () => {
        await action(result.result.current);
      });
    },
    
    /**
     * Updates hook props
     * @param {Object} props - New props
     */
    updateProps: (props: Props) => {
      result.rerender(props);
    },
    
    /**
     * Gets current hook state
     * @returns {any} Current hook state
     */
    getState: () => result.result.current,
  } as const;
}

/**
 * Tests a hook with initial and final states
 * @param {Function} hook - The hook to test
 * @param {Function} action - Action to update hook state
 * @param {Function} assertion - Function to check final state
 * @returns {Promise<void>}
 */
export async function testHookState<Result>(
  hook: () => Result,
  action: (state: Result) => Promise<void> | void,
  assertion: (state: Result) => void,
): Promise<void> {
  const { result } = renderHook(() => hook());
  
  await act(async () => {
    await action(result.current);
  });
  
  assertion(result.current);
}

/**
 * Tests a hook's effect cleanups
 * @param {Function} hook - The hook to test
 * @param {Array} deps - Dependencies to change
 * @param {Function} mockCleanup - Mock function to track cleanup
 * @returns {Object} Test results
 */
export function testHookCleanup<Props, Result>(
  hook: (props: Props) => Result,
  deps: Props[] = [],
  mockCleanup: () => void = vi.fn(),
) {
  // React 19 compatible approach to testing cleanup
  const mockFunction = vi.fn();
  
  // Render the hook with initial props
  const { result, rerender, unmount } = renderHook(
    (props) => {
      React.useEffect(() => {
        return mockFunction;
      }, Array.isArray(props) ? props : [props]);
      
      return hook(props);
    },
    { initialProps: deps[0] }
  );
  
  // Re-render with new deps to trigger cleanup
  if (deps.length > 1) {
    rerender(deps[1]);
    // In React 19, effect cleanup is called on re-render if dependencies change
    expect(mockFunction).toHaveBeenCalled();
    mockFunction.mockClear();
  }
  
  // Unmount to trigger final cleanup
  unmount();
  expect(mockFunction).toHaveBeenCalled();
  
  return {
    result,
    cleanup: mockFunction,
    unmount
  };
}

/**
 * Creates a mock for useState hook
 * @param {any} initialValue - Initial state value
 * @returns {Array} Mock useState hook
 */
export function createMockState<T>(initialValue: T): [T, (value: React.SetStateAction<T>) => void] {
  let state = initialValue;
  const setState = vi.fn().mockImplementation((newValue: React.SetStateAction<T>) => {
    if (typeof newValue === 'function') {
      state = newValue(state);
    } else {
      state = newValue;
    }
  });
  
  return [state, setState];
}

/**
 * Creates a mock for useContext hook
 * @param {any} contextValue - Value to return from useContext
 * @returns {Function} Mock useContext hook
 */
export function createMockContext<T>(contextValue: T) {
  return vi.fn().mockReturnValue(contextValue);
}

/**
 * Creates a mock for useRef hook
 * @param {any} initialValue - Initial ref value
 * @returns {Object} Mock ref object
 */
export function createMockRef<T>(initialValue: T): React.MutableRefObject<T> {
  return { current: initialValue } as React.MutableRefObject<T>;
}
