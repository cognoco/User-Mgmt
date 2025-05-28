import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { decode } from 'base64-arraybuffer';

import {
  createSuccessResponse,
  createNoContentResponse,
} from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { withRouteAuth } from '@/middleware/auth';

import { createUserUpdateFailedError } from '@/lib/api/user/error-handler';

import { getApiUserService } from '@/services/user/factory';

// Schema for avatar upload request body (supports both custom uploads and predefined avatars)
const AvatarUploadSchema = z.object({
  // For custom uploads: Base64 string of the image
  avatar: z.string().optional(),
  // For predefined avatars: ID or URL of the predefined avatar
  avatarId: z.string().optional(),
  filename: z.string().optional(), // Optional filename for content type inference
}).refine(data => data.avatar || data.avatarId, {
  message: "Either 'avatar' or 'avatarId' is required"
});


const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Predefined avatars - These would typically be stored in a database or config file
// For now, we're hardcoding them here
const PREDEFINED_AVATARS = [
  { id: 'avatar1', url: '/assets/avatars/avatar1.png', name: 'Default 1' },
  { id: 'avatar2', url: '/assets/avatars/avatar2.png', name: 'Default 2' },
  { id: 'avatar3', url: '/assets/avatars/avatar3.png', name: 'Default 3' },
  { id: 'avatar4', url: '/assets/avatars/avatar4.png', name: 'Default 4' },
  { id: 'avatar5', url: '/assets/avatars/avatar5.png', name: 'Default 5' },
  { id: 'avatar6', url: '/assets/avatars/avatar6.png', name: 'Default 6' },
];

async function handleGetAvatars() {
  return createSuccessResponse({ avatars: PREDEFINED_AVATARS });
}

async function handleUploadAvatar(
  req: NextRequest,
  userId: string,
  data: z.infer<typeof AvatarUploadSchema>
) {
  const userService = getApiUserService();
  let avatarUrl: string | undefined;

  if (data.avatarId) {
    const selected = PREDEFINED_AVATARS.find((a) => a.id === data.avatarId);
    if (!selected) {
      throw createUserUpdateFailedError('Invalid predefined avatar ID');
    }
    const result = await userService.updateUserProfile(userId, {
      avatarUrl: selected.url,
    } as any);
    if (!result.success || !result.profile) {
      throw createUserUpdateFailedError(result.error);
    }
    avatarUrl = result.profile.avatarUrl || selected.url;
  } else if (data.avatar) {
    const match = data.avatar.match(/^data:(.+);base64,/);
    if (!match) {
      throw createUserUpdateFailedError('Invalid base64 image format.');
    }
    const mimeType = match[1];
    const base64Data = data.avatar.replace(/^data:.+;base64,/, '');
    const fileBuffer = decode(base64Data);

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw createUserUpdateFailedError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
      throw createUserUpdateFailedError(
        `File size exceeds the maximum limit of ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB.`
      );
    }

    const blob = new Blob([fileBuffer], { type: mimeType });
    const uploadResult = await userService.uploadProfilePicture(userId, blob);
    if (!uploadResult.success || !uploadResult.imageUrl) {
      throw createUserUpdateFailedError(uploadResult.error);
    }
    avatarUrl = uploadResult.imageUrl;
  } else {
    throw createUserUpdateFailedError(
      'Either a custom avatar or predefined avatar ID is required.'
    );
  }

  return createSuccessResponse({
    avatarUrl,
    message: 'Avatar updated successfully.',
  });
}

async function handleDeleteAvatar(userId: string) {
  const userService = getApiUserService();
  const result = await userService.deleteProfilePicture(userId);
  if (!result.success) {
    throw createUserUpdateFailedError(result.error);
  }
  return createNoContentResponse();
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGetAvatars, request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(
    (req) =>
      withRouteAuth((r, auth) => withValidation(AvatarUploadSchema, (r2, data) => handleUploadAvatar(r2, auth.userId!, data), r), req),
    request
  );
}

export async function DELETE(request: NextRequest) {
  return withErrorHandling(
    (req) => withRouteAuth((r, auth) => handleDeleteAvatar(auth.userId!), req),
    request
  );
}
