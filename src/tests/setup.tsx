import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, afterEach, afterAll, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import React from 'react';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Configure React for testing
// Assign React to globalThis for test environments
(globalThis as any).React = React;

// Mock components
vi.mock('@/ui/primitives/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}));

vi.mock('@/ui/primitives/label', () => ({
  Label: ({ children, ...props }: React.ComponentProps<'label'>) => <label {...props}>{children}</label>,
}));

vi.mock('@/ui/primitives/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}));

vi.mock('@/ui/primitives/checkbox', () => ({
  Checkbox: (props: React.ComponentProps<'input'>) => <input type="checkbox" {...props} />,
}));

vi.mock('@/ui/primitives/alert', () => ({
  Alert: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div role="alert" {...props}>{children}</div>,
  AlertTitle: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h5 {...props}>{children}</h5>,
  AlertDescription: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    query: {},
  }),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string } & React.ImgHTMLAttributes<HTMLImageElement>) => <img src={src} alt={alt} {...props} />,
}));

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};
// Assign localStorage and matchMedia mocks directly to globalThis
(globalThis as any).localStorage = localStorageMock;
(globalThis as any).matchMedia = vi.fn().mockImplementation((query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia;

// Setup MSW
export const server = setupServer();
(globalThis as any).server = server;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  cleanup();
}); 