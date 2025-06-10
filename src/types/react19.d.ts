/**
 * Extended React TypeScript declarations for React 19
 */

import 'react';

declare module 'react' {
  // Add any missing types or declarations for React 19 here
  
  /**
   * Extended TransitionStartFunction type to include support for Promise return types
   */
  interface TransitionStartFunction {
    (callback: () => void | Promise<void>): void;
  }
  
  /**
   * Extended UseTransitionResult type to match React 19's implementation
   */
  type UseTransitionResult = [boolean, TransitionStartFunction];
  
  /**
   * Defined type for useTransition hook
   */
  export function useTransition(): UseTransitionResult;
  
  /**
   * Defined ErrorInfo type for error boundaries
   */
  interface ErrorInfo {
    componentStack: string;
  }
} 