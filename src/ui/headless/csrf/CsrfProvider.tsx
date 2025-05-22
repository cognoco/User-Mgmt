import React, { createContext, useContext } from 'react';
import type { CsrfService } from '@/core/csrf/interfaces';

interface CsrfProviderProps {
  csrfService: CsrfService;
  children: React.ReactNode;
}

const CsrfContext = createContext<CsrfService | null>(null);

export const CsrfProvider: React.FC<CsrfProviderProps> = ({ csrfService, children }) => (
  <CsrfContext.Provider value={csrfService}>{children}</CsrfContext.Provider>
);

export function useCsrfService(): CsrfService {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error('useCsrfService must be used within a CsrfProvider');
  }
  return context;
}

export default CsrfProvider;
