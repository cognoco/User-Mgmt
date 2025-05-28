'use client';

/**
 * App Initializer Component
 * 
 * This component initializes the application by importing and executing the app-init.ts file.
 * It should be included at the root level of the application to ensure services are registered
 * before any components try to use them.
 */

import { useEffect, useState } from 'react';
import initializeApp from '@/core/initialization/app-init';
import { UserManagementConfiguration } from '@/core/config';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('[AppInitializer] Initializing application...');
      // Initialize the application and get the service instances
      const services = initializeApp();

      // Example: register global error handler for API calls
      window.addEventListener('unhandledrejection', (e) => {
        console.error('[AppInitializer] Unhandled promise rejection', e.reason);
      });
      
      // Ensure services are properly registered with UserManagementConfiguration
      UserManagementConfiguration.configureServiceProviders({
        authService: services.authService,
        userService: services.userService,
        teamService: services.teamService,
        permissionService: services.permissionService,
        webhookService: services.webhookService
      });
      
      console.log('[AppInitializer] Application initialized successfully');
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during initialization';
      console.error('[AppInitializer] Failed to initialize application:', errorMessage);
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
