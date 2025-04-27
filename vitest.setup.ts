// Add dummy environment variables for Supabase client initialization
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'; // Dummy key

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { createMockAuthStore } from '@/tests/mocks/auth.store.mock';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// --- Restore Critical Mocks --- 
// --- Mock global fetch --- 
const fetchMock = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}), // Default empty JSON response
    text: () => Promise.resolve(''), // Default empty text response
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
    // Add other Response properties if needed by code under test
  } as Response)
);
vi.stubGlobal('fetch', fetchMock);
// --- End fetch mock --- 

// --- Mock react-i18next --- 
vi.mock('react-i18next', () => ({
  // Mock the useTranslation hook
  useTranslation: () => ({
    t: (key: string) => `[i18n:${key}]`, // Return key wrapped for identification
    i18n: {
      changeLanguage: () => new Promise(() => {}), // Mock function doesn't need to resolve
      // Add other i18n properties/methods if needed by components
      language: 'en',
      options: {},
      isInitialized: true,
      // ... add other needed i18n instance methods/properties
    },
  }),
  // Mock Trans component if used
  Trans: ({ i18nKey }: { i18nKey: string }) => `[i18n:${i18nKey}]`, // Apply same logic to Trans
  // Mock I18nextProvider if needed (usually not needed if useTranslation is mocked)
  // I18nextProvider: ({ children }) => children,
}));
// --- End react-i18next mock ---

// --- Mock Axios instance used by UserManagementProvider --- 
vi.mock('@/lib/api/axios', () => ({
    api: {
        // Provide mock implementations for axios methods used by the app
        // Start with common ones, add more if needed based on errors
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
        put: vi.fn(() => Promise.resolve({ data: {} })),
        delete: vi.fn(() => Promise.resolve({ data: {} })),
        defaults: { // Mock defaults object as well
            baseURL: '',
            headers: {
                common: {},
            },
        },
        interceptors: { // Mock interceptors if accessed
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() },
        },
        // Add other axios properties/methods if needed
    }
}));
// --- End Axios mock --- 

// --- Mock Auth Store --- 
const mockStore = createMockAuthStore();
Object.assign(mockStore, {
  setState: mockStore.setState,
  getState: mockStore.getState,
  subscribe: mockStore.subscribe,
  destroy: mockStore.destroy,
});
vi.mock('@/lib/stores/auth.store', () => ({ useAuthStore: mockStore }));
// --- End Auth Store mock --- 

// --- Mock User Store ---
vi.mock('@/lib/stores/user.store', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'testuser@example.com', name: 'Test User' },
    setUser: vi.fn(),
    clearUser: vi.fn(),
    // Add other user store functions/state as needed
  })),
}));
// --- End User Store mock ---

// Mock other global dependencies or setup if needed 

// --- Robust Mocks for External APIs ---

// Mock Google OAuth Provider and hook
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: any }) => children,
  useGoogleLogin: () => ({
    signIn: vi.fn().mockResolvedValue({
      profileObj: {
        email: 'testuser@example.com',
        name: 'Test User',
        imageUrl: 'https://example.com/avatar.png',
      },
      tokenId: 'fake-google-token',
    }),
  }),
}));

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({
    redirectToCheckout: vi.fn().mockResolvedValue({}),
    createPaymentMethod: vi.fn().mockResolvedValue({ id: 'pm_test_123' }),
    confirmCardPayment: vi.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded' } }),
  }),
}));

// Mock a generic limits/rate-limits provider if present
vi.mock('@/lib/services/limits', () => ({
  useLimits: () => ({
    getLimit: vi.fn().mockReturnValue(100),
    getRemaining: vi.fn().mockReturnValue(50),
    isLimitReached: vi.fn().mockReturnValue(false),
  }),
}));

// --- Mock window.matchMedia for JSDOM (required for ThemeProvider and media queries in tests) ---
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
// --- End matchMedia mock --- 

// --- Mock next/navigation for Next.js App Router hooks ---
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      basePath: '',
      isFallback: false,
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  };
});
// --- End next/navigation mock --- 

// --- Mock ResizeObserver for JSDOM (required for Radix UI components in tests) ---
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
// --- End ResizeObserver mock ---