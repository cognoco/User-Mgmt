import React, { createContext, useContext } from 'react';
import type { AuthService } from '@/core/auth/interfaces';

interface AuthContextValue {
  authService: AuthService;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  authService: AuthService;
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ authService, children }) => {
  return <AuthContext.Provider value={{ authService }}>{children}</AuthContext.Provider>;
};

export function useAuthService(): AuthService {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthService must be used within an AuthProvider');
  }
  return context.authService;
}

export default AuthProvider;
