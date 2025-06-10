// src/tests/utils/test-wrapper.tsx
import React, { useEffect } from 'react';
import { setupTestServices } from '@/tests/utils/testServiceSetup';
import { AuthProvider } from '@/lib/context/AuthContext';

interface TestWrapperProps {
  children: React.ReactNode;
  customServices?: Record<string, any>;
  authenticated?: boolean;
  withDefaultUser?: boolean;
}

/**
 * Test wrapper component that provides the necessary context for UI component testing
 * 
 * This component sets up mock services and provides them to the component tree.
 * It can also optionally set up an authenticated user for testing authenticated components.
 * 
 * @example
 * render(
 *   <TestWrapper authenticated>
 *     <HeadlessProfile render={({ user }) => <div>{user?.name}</div>} />
 *   </TestWrapper>
 * );
 */
export function TestWrapper({ 
  children, 
  customServices = {}, 
  authenticated = false,
  withDefaultUser = true
}: TestWrapperProps) {
  // Setup services before rendering
  const { mockAuthService } = setupTestServices(customServices);
  
  // Set up authentication state if needed
  useEffect(() => {
    if (authenticated) {
      mockAuthService.setMockAuthState({
        isAuthenticated: true,
        token: 'mock-token'
      });
    }
  }, [authenticated, mockAuthService]);
  
  return <AuthProvider authService={mockAuthService}>{children}</AuthProvider>;
}