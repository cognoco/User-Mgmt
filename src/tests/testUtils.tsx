import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { vi } from 'vitest'; // Added for Vitest 3.x compatibility

// Enhanced render function compatible with Vitest 3.x
function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <React.StrictMode>{children}</React.StrictMode>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock function helper for better type inference in Vitest 3.x
const mockFn = vi.fn;

// re-export everything
export * from '@testing-library/react';
// override render method
export { render, mockFn }; 