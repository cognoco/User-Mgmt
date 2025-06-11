import { vi } from "vitest";
export const createMockUserService = () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    id: 'u1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    userType: 'private'
  }),
  updateUserProfile: vi.fn().mockResolvedValue({ success: true }),
  uploadAvatar: vi.fn().mockResolvedValue({ avatarUrl: 'avatar.jpg' }),
  deleteAvatar: vi.fn().mockResolvedValue({ success: true }),
  exportData: vi.fn().mockResolvedValue({ exportId: 'export123' }),
});

