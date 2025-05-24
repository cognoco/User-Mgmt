import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';

/**
 * Middleware to validate request body or provided data against a schema.
 */
export async function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>,
  req: NextRequest,
  data?: unknown
): Promise<NextResponse> {
  try {
    const input = data ?? (await req.json());
    const validatedData = schema.parse(input);
    return await handler(req, validatedData);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const validationError = new ApiError(
        'validation/error',
        'Validation failed',
        400,
        { errors: error.errors }
      );
      return createErrorResponse(validationError);
    }

    throw error;
  }
}
