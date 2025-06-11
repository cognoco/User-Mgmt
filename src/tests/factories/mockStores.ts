import { vi } from "vitest";
export const createMockProfileStore = () => ({
  profile: { id: 'u1', firstName: 'Test', lastName: 'User' },
  isLoading: false,
  error: null,
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
  setProfile: vi.fn(),
});

export const createMockOAuthStore = () => ({
  login: vi.fn(),
  isLoading: false,
  error: null,
  clearError: vi.fn(),
});

