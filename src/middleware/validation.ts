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
    let input: unknown;
    
    if (data !== undefined) {
      input = data;
    } else {
      try {
        input = await req.json();
      } catch (error) {
        // Handle invalid or empty JSON
        const validationError = createValidationError(
          'Invalid request body: Expected valid JSON'
        );
        return createErrorResponse(validationError);
      }
    }
    
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
