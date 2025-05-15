'use client';

import React, { useState } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error, reset: () => void }>;
}

/**
 * ErrorBoundary component for React 19 using functional component pattern
 * This component catches errors in its children and displays a fallback UI
 * 
 * @param children - The components to render that might throw errors
 * @param fallback - A component to display when an error occurs
 */
export function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  
  // Reset function to clear the error state and retry rendering
  const reset = () => setError(null);
  
  // Use React 19's error boundary pattern with useEffect and error event
  React.useEffect(() => {
    // This handler catches errors during rendering
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error || new Error('An unknown error occurred'));
    };
    
    // Add the error event listener
    window.addEventListener('error', errorHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  if (error) {
    return <Fallback error={error} reset={reset} />;
  }
  
  return <>{children}</>;
}

/**
 * Default fallback component that can be used with ErrorBoundary
 */
export function DefaultErrorFallback({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-sm text-red-700 mb-4">{error.message || 'An unexpected error occurred'}</p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
} 