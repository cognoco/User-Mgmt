import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiOAuthService } from '@/services/oauth/factory';

const linkRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
});

async function handleLink(
  _req: NextRequest,
  data: z.infer<typeof linkRequestSchema>,
) {
  const service = getApiOAuthService();
  const result = await service.linkProvider(data.provider, data.code);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }
  return NextResponse.json({
    success: true,
    linkedProviders: result.linkedProviders ?? [],
    user: result.user,
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(linkRequestSchema, handleLink, req),
    request,
  );
}
