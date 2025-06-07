import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'89;
import { createSuccessResponse } from '@/lib/api/common';

const consentSchema = z.object({
  marketing: z.boolean(),
});

export const GET = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const consent = await services.consent.getUserConsent(authContext.userId);
    if (!consent) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
    }
    return createSuccessResponse(consent);
  },
  {
    requireAuth: true,
  }
);

export const POST = createApiHandler(
  consentSchema,
  async (request: NextRequest, authContext: any, data: z.infer<typeof consentSchema>, services: any) => {
    const result = await services.consent.updateUserConsent(authContext.userId, { marketing: data.marketing });
    if (!result.success || !result.consent) {
      return NextResponse.json({ error: result.error || 'Failed to save consent' }, { status: 500 });
    }
    return createSuccessResponse(result.consent);
  },
  {
    requireAuth: true,
  }
);
