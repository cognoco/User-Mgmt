import { vi } from "vitest";
export const mockUseAuth = {
  authenticated: () => ({
    user: { id: 'u1', email: 'test@example.com', name: 'Test User' },
    isLoading: false,
    logout: vi.fn(),
    login: vi.fn(),
  }),
  loading: () => ({
    user: null,
    isLoading: true,
    logout: vi.fn(),
    login: vi.fn(),
  }),
  unauthenticated: () => ({
    user: null,
    isLoading: false,
    logout: vi.fn(),
    login: vi.fn(),
  })
};

export const mockUseTeams = {
  success: () => ({
    createTeam: vi.fn().mockResolvedValue({ success: true, team: { id: 't1' } }),
    teams: [],
    isLoading: false,
    error: null,
  }),
  // ... other states
};
