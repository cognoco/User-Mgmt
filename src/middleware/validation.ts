import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import {
  createErrorResponse,
  createValidationError,
} from '@/lib/api/common';

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
    if (error instanceof ZodError) {
      const validationError = createValidationError(
        'Validation failed',
        error.flatten()
      );
      return createErrorResponse(validationError);
    }

    throw error;
  }
}
