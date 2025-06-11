import { vi } from "vitest";
export const createMockExternalDeps = () => ({
  // WebAuthn
  startRegistration: vi.fn().mockResolvedValue({ credential: 'cred123' }),
  startAuthentication: vi.fn().mockResolvedValue({ credential: 'auth123' }),
  
  // Next.js
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  
  // Toast/UI
  useToast: () => ({ toast: vi.fn() }),
});
