import { z } from 'zod';
import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';

const CompanySchema = z.object({ companyName: z.string() });

export const POST = createApiHandler(
  CompanySchema,
  async (req: NextRequest, authContext: any, data: z.infer<typeof CompanySchema>, services: any) => {
    const { companyName } = data;

    const cleaned = companyName.trim();
    const validChars = /^[a-zA-Z0-9 .,&'-]+$/;
    const words = cleaned.split(/\s+/);

    const isValid =
      cleaned.length >= 3 &&
      validChars.test(cleaned) &&
      words.length >= 2 &&
      words.every((w) => w.length > 1);
    return createSuccessResponse({ valid: isValid });
  },
  {
    requireAuth: false, // Company name validation can be public
  }
);
