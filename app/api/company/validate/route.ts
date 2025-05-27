import { z } from 'zod';
import { NextRequest } from 'next/server';
import { withErrorHandling } from '@/middleware/error-handling';
import { createSuccessResponse, createValidationError } from '@/lib/api/common';

const CompanySchema = z.object({ companyName: z.string() });

async function handlePost(req: NextRequest) {
  const body = await req.json();
  const parse = CompanySchema.safeParse(body);
  if (!parse.success) {
    throw createValidationError('Invalid input');
  }
  const { companyName } = parse.data;

  const cleaned = companyName.trim();
  const validChars = /^[a-zA-Z0-9 .,&'-]+$/;
  const words = cleaned.split(/\s+/);

  const isValid =
    cleaned.length >= 3 &&
    validChars.test(cleaned) &&
    words.length >= 2 &&
    words.every((w) => w.length > 1);
  return createSuccessResponse({ valid: isValid });
}

export function POST(request: NextRequest) {
  return withErrorHandling(handlePost, request);
}
