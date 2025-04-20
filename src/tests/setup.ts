// Add dummy environment variables for Supabase client initialization
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'; // Dummy key

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    domain: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    ssoConfig: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// --- REMOVED Radix UI JSDOM Mocks --- 
// Previous attempts to mock/polyfill PointerEvent methods were ineffective
// against the 'hasPointerCapture' error, even with happy-dom.
// Keeping setup clean for now. 