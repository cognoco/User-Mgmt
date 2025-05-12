import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { PaletteProvider } from '@/components/PaletteProvider';

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <React.StrictMode>
        <ThemeProvider>
          <PaletteProvider>
            {children}
          </PaletteProvider>
        </ThemeProvider>
      </React.StrictMode>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render }; 