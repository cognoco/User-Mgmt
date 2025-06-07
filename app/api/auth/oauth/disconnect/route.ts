import { type NextRequest } from 'next/server';
import { z } from "zod";
import { OAuthProvider } from "@/types/oauth";
import { createApiHandler } from "@/lib/api/routeHelpers"123;
import type { AuthContext, ServiceContainer } from "@/core/config/interfaces";
import { getApiOAuthService } from "@/services/oauth/factory";
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import { logUserAction } from '@/lib/audit/auditLogger';

// Request schema
const disconnectRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
});

async function handlePost(
  request: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof disconnectRequestSchema>,
  services: ServiceContainer,
) {
  const { provider } = data;
  const service = services.oauth ?? getApiOAuthService();
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const result = await service.disconnectProvider(provider);

  await logUserAction({
    userId: auth.userId,
    action: 'OAUTH_DISCONNECT',
    status: result.success ? 'SUCCESS' : 'FAILURE',
    ipAddress,
    userAgent,
    targetResourceType: 'oauth',
    targetResourceId: provider,
    details: { error: result.success ? null : result.error }
  });

  if (!result.success) {
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      result.error || 'Failed to disconnect provider',
      result.status ?? 500
    );
  }

  return createSuccessResponse({ success: true });
}

export const POST = createApiHandler(disconnectRequestSchema, handlePost, {
  requireAuth: true,
  rateLimit: { windowMs: 15 * 60 * 1000, max: 10 }
});
