'use client';

/**
 * App Initializer Component
 * 
 * This component provides a client-side wrapper that bypasses server-side initialization
 * since Next.js handles service initialization on the server.
 */

import { useEffect, useState } from 'react';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      console.error('[App] Unhandled error:', e.error);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  useEffect(() => {
    try {
      console.log('[AppInitializer] Client-side initialization...');
      
      // Client-side initialization is minimal - services are initialized on server
      // This is just for client-side configuration and state management
      
      console.log('[AppInitializer] Client initialized successfully');
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during initialization';
      console.error('[AppInitializer] Failed to initialize client:', errorMessage);
      setError(errorMessage);
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-700 mb-4">
            The application failed to initialize properly. Please try refreshing the page or contact support if the issue persists.
          </p>
          <div className="p-3 bg-red-50 rounded text-sm text-red-800 font-mono overflow-auto">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
