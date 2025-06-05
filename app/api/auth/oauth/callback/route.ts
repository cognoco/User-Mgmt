import { NextRequest } from "next/server";
import { z } from "zod";
import { OAuthProvider } from "@/types/oauth";
import { createSuccessResponse } from "@/lib/api/common";
import { withErrorHandling } from "@/middleware/error-handling";
import { withValidation } from "@/middleware/validation";
import { getApiOAuthService } from "@/services/oauth/factory";

// Request schema
const callbackRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional(), // Add state for CSRF protection
});

async function handleCallback(
  _req: NextRequest,
  data: z.infer<typeof callbackRequestSchema>,
) {
  const { provider, code, state } = data;
  const service = getApiOAuthService();
  const result = await service.handleCallback(provider, code, state);
  return createSuccessResponse(result);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(callbackRequestSchema, handleCallback, req),
    request,
  );
}
