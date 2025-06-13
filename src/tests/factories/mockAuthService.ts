export const createMockAuthService = () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1', email: 'test@example.com' }),
  deleteAccount: vi.fn().mockResolvedValue({ success: true }),
  updatePassword: vi.fn().mockResolvedValue({ success: true }),
  login: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue({ token: 'new-token' }),
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  verifyEmail: vi.fn().mockResolvedValue({ success: true }),
});
