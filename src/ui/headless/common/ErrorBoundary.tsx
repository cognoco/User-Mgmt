import React, { useState, useEffect } from 'react';

/**
 * Headless Error Boundary
 *
 * Captures errors from child components and exposes them via a render prop.
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  render: (props: { error: Error | null; reset: () => void; children: React.ReactNode }) => React.ReactNode;
}

export function ErrorBoundary({ children, render }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const reset = () => setError(null);

  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error || new Error('An unknown error occurred'));
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  return <>{render({ error, reset, children: error ? null : children })}</>;
}

export default ErrorBoundary;
