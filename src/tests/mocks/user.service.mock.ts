import { vi } from "vitest";
import type {
  UserService,
  UserProfile,
  ProfileUpdatePayload,
  UserProfileResult,
  ProfileVisibility,
  UserSearchParams,
  UserSearchResult,
} from "@/core/user/interfaces";

export function createMockUserService(
  overrides: Partial<UserService> = {},
): UserService {
  const defaultProfile: UserProfile = {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    bio: "",
    location: "",
    website: "",
    profilePictureUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibility: { showEmail: false, showLocation: false },
    type: "personal",
  } as UserProfile;

  const service: UserService = {
    getUserProfile: vi.fn(async () => defaultProfile),
    updateUserProfile: vi.fn(
      async (
        _id: string,
        data: ProfileUpdatePayload,
      ): Promise<UserProfileResult> => ({
        success: true,
        profile: { ...defaultProfile, ...data },
      }),
    ),
    getUserPreferences: vi.fn(async () => ({
      notifications: { email: true },
    })) as any,
    updateUserPreferences: vi.fn(async () => ({
      success: true,
      preferences: { notifications: { email: true } },
    })) as any,
    uploadProfilePicture: vi.fn(async () => ({
      success: true,
      imageUrl: "http://example.com/avatar.png",
    })),
    deleteProfilePicture: vi.fn(async () => ({ success: true })),
    updateProfileVisibility: vi.fn(
      async (_id: string, visibility: ProfileVisibility) => ({
        success: true,
        visibility,
      }),
    ),
    searchUsers: vi.fn(async (_params: UserSearchParams) => ({
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    })) as any,
    deactivateUser: vi.fn(async () => ({ success: true })),
    reactivateUser: vi.fn(async () => ({ success: true })),
    convertUserType: vi.fn(async () => ({
      success: true,
      profile: defaultProfile,
    })),
    onUserProfileChanged: vi.fn(() => () => {}),
    ...overrides,
  } as UserService;

  return service;
}

export default createMockUserService;
