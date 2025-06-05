import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { OAuthProvider } from "@/types/oauth";
import { createApiHandler } from "@/lib/api/route-helpers";
import type { AuthContext, ServiceContainer } from "@/core/config/interfaces";
import { getApiOAuthService } from "@/services/oauth/factory";

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
  const result = await service.disconnectProvider(provider);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }
  return NextResponse.json({ success: true });
}

export const POST = createApiHandler(disconnectRequestSchema, handlePost, {
  requireAuth: true,
});
