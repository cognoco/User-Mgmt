import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rateLimit'89;
import { decode } from 'base64-arraybuffer';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'194;
import { createSuccessResponse } from '@/lib/api/common';

// Schema for logo upload request body
const LogoUploadSchema = z.object({
  logo: z.string(), // Expecting base64 string
  filename: z.string().optional(), // Optional filename for content type inference
});

export const POST = createApiHandler(
  LogoUploadSchema,
  async (request: NextRequest, { userId }, data, services) => {
    const isRateLimited = await checkRateLimit(request);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const base64Data = data.logo.replace(/^data:.+;base64,/, '');
    const fileBuffer = decode(base64Data);

    const result = await services.user.uploadCompanyLogo(userId!, userId!, fileBuffer);
    if (!result.success || !result.url) {
      return NextResponse.json({ error: result.error || 'Failed to upload logo' }, { status: 500 });
    }

    return createSuccessResponse({ companyLogoUrl: result.url });
  },
  { requireAuth: true }
);

export const DELETE = createApiHandler(
  emptySchema,
  async (request: NextRequest, { userId }, _data, services) => {
    const isRateLimited = await checkRateLimit(request);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const result = await services.user.deleteCompanyLogo(userId!, userId!);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to remove logo' }, { status: 500 });
    }

    return createSuccessResponse({ message: 'Company logo removed successfully.' });
  },
  { requireAuth: true }
);
