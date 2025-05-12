import './src/tests/setup';

// Add dummy environment variables for Supabase client initialization
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'; // Dummy key

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { createMockAuthStore } from '@/tests/mocks/auth.store.mock';
import en from '@/lib/i18n/locales/en.json';

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

// --- Global mock for react-i18next to ensure consistent translation behavior in all tests ---

function getNestedTranslation(obj: any, key: string): string {
  return key.split('.').reduce((acc, part) => acc?.[part], obj) ?? key;
}

vi.mock('react-i18next', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, params?: Record<string, string>) => {
        // Handle [i18n:KEY] pattern
        let lookupKey = key;
        const i18nMatch = /^\[i18n:(.+)\]$/.exec(key);
        if (i18nMatch) {
          lookupKey = i18nMatch[1];
        }
        let value = getNestedTranslation(en, lookupKey);
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            value = value.replace(new RegExp(`{{${k}}}`, 'g'), v);
          });
        }
        return value;
      },
      i18n: { changeLanguage: () => Promise.resolve() },
    }),
    Trans: ({ i18nKey }: { i18nKey: string }) => getNestedTranslation(en, i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});
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
// (Removed robust Zustand mock; let each test file provide its own mock if needed)
// vi.mock('@/lib/stores/user.store', () => ({
//   useUserStore: userStoreMock,
// }));
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

// --- JSDOM/Browser API Polyfills for Testing ---
// These mocks/polyfills are required for JSDOM compatibility and to prevent test failures unrelated to app logic.

if (!window.scrollTo) window.scrollTo = () => {};
if (!window.HTMLElement.prototype.scrollIntoView) window.HTMLElement.prototype.scrollIntoView = () => {};
if (!window.HTMLElement.prototype.releasePointerCapture) window.HTMLElement.prototype.releasePointerCapture = () => {};
if (!window.HTMLElement.prototype.hasPointerCapture) window.HTMLElement.prototype.hasPointerCapture = () => false;
if (!window.HTMLElement.prototype.setPointerCapture) window.HTMLElement.prototype.setPointerCapture = () => {};
if (!window.HTMLElement.prototype.requestFullscreen) window.HTMLElement.prototype.requestFullscreen = () => Promise.resolve();
if (!window.ClipboardEvent) window.ClipboardEvent = class ClipboardEvent extends Event { constructor(type: string, eventInitDict?: ClipboardEventInit) { super(type, eventInitDict); } } as any;
if (!window.DataTransfer) window.DataTransfer = class DataTransfer { constructor() { this.items = []; this.files = []; } items: any[]; files: any[]; } as any;
if (!window.FileReader) {
  class MockFileReader {
    static readonly EMPTY = 0 as const;
    static readonly LOADING = 1 as const;
    static readonly DONE = 2 as const;
    get EMPTY() { return MockFileReader.EMPTY; }
    get LOADING() { return MockFileReader.LOADING; }
    get DONE() { return MockFileReader.DONE; }
    readyState: 0 | 1 | 2 = 0;
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    abort() { this.readyState = 0; if (this.onabort) this.onabort.call(this, {} as any); }
    readAsArrayBuffer() { this.readyState = 2; if (this.onload) this.onload.call(this, {} as any); }
    readAsBinaryString() { this.readyState = 2; if (this.onload) this.onload.call(this, {} as any); }
    readAsText() { this.readyState = 2; if (this.onload) this.onload.call(this, {} as any); }
    readAsDataURL() { this.readyState = 2; if (this.onload) this.onload.call(this, {} as any); }
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  }
  window.FileReader = MockFileReader as any;
}
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => 'blob:http://localhost/fake';
if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = () => {};
if (!window.IntersectionObserver) {
  class MockIntersectionObserver {
    root: Element | null = null;
    rootMargin: string = '';
    thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  window.IntersectionObserver = MockIntersectionObserver as any;
}
if (!window.DOMRect) {
  class MockDOMRect {
    static fromRect() { return new MockDOMRect(); }
    x = 0; y = 0; width = 0; height = 0;
    top = 0; right = 0; bottom = 0; left = 0;
    toJSON() { return this; }
  }
  window.DOMRect = MockDOMRect as any;
}
if (!window.getComputedStyle) window.getComputedStyle = () => ({
  getPropertyValue: () => '',
  setProperty: () => {},
  removeProperty: () => '',
  length: 0,
  item: () => null,
  getPropertyPriority: () => '',
  [Symbol.iterator]: function* () {},
} as any);
if (!window.crypto) window.crypto = {} as Crypto;
if (!window.crypto.getRandomValues) window.crypto.getRandomValues = (arr: ArrayBufferView) => { for (let i = 0; i < arr.byteLength; i++) (arr as any)[i] = Math.floor(Math.random() * 256); return arr; };
try {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText: async () => {}, readText: async () => '' },
    configurable: true,
  });
} catch {}
if (!window.ResizeObserver) window.ResizeObserver = class { observe() {}; unobserve() {}; disconnect() {}; };

// --- End JSDOM/Browser API Polyfills ---