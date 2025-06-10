import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "@/hooks/auth/useAuth";
import { UserManagementConfiguration } from "@/core/config";
import type { AuthService } from "@/core/auth/interfaces";
import type { User } from "@/core/auth/models";

const mockAuthService: AuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  sendVerificationEmail: vi.fn(),
  verifyEmail: vi.fn(),
  deleteAccount: vi.fn(),
  setupMFA: vi.fn(),
  verifyMFA: vi.fn(),
  disableMFA: vi.fn(),
  refreshToken: vi.fn(),
  handleSessionTimeout: vi.fn(),
  onAuthStateChanged: vi.fn(),
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    UserManagementConfiguration.reset();
    UserManagementConfiguration.configureServiceProviders({
      authService: mockAuthService,
    });
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.onAuthStateChanged.mockImplementation(() => () => {});
  });

  afterEach(() => {
    UserManagementConfiguration.reset();
  });

  it("logs in successfully", async () => {
    const user: User = { id: "1", email: "test@example.com" };
    vi.mocked(mockAuthService.login).mockResolvedValue({ success: true, user });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "pass");
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass",
    });
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("handles login error", async () => {
    vi.mocked(mockAuthService.login).mockRejectedValue(
      new Error("Invalid credentials"),
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "wrong");
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("sends and verifies email", async () => {
    vi.mocked(mockAuthService.sendVerificationEmail).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.sendVerificationEmail("a@test.com");
    });

    expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith("a@test.com");

    vi.mocked(mockAuthService.verifyEmail).mockResolvedValue();

    await act(async () => {
      const res = await result.current.verifyEmail("token");
      expect(res.success).toBe(true);
    });
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith("token");
  });
});
