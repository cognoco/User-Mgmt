import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@/ui/primitives/theme-provider';
import { PaletteProvider } from '@/ui/primitives/PaletteProvider';
import '../i18nTestSetup';
import { UserManagementProvider } from '@/lib/auth/UserManagementProvider';

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <React.StrictMode>
        <UserManagementProvider>
          <ThemeProvider>
            <PaletteProvider>
              {children}
            </PaletteProvider>
          </ThemeProvider>
        </UserManagementProvider>
      </React.StrictMode>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render }; 