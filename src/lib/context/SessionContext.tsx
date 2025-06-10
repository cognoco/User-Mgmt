import React, { createContext, useContext } from 'react';
import type { SessionService } from '@/core/session/interfaces';

interface SessionContextValue {
  sessionService: SessionService;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export interface SessionProviderProps {
  sessionService: SessionService;
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ sessionService, children }) => (
  <SessionContext.Provider value={{ sessionService }}>{children}</SessionContext.Provider>
);

export function useSessionService(): SessionService {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionService must be used within a SessionProvider');
  }
  return context.sessionService;
}

export default SessionProvider;
