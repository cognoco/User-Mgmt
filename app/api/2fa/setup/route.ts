import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { TwoFactorMethod } from '@/types/2fa';
import { createApiHandler } from '@/lib/api/routeHelpers'137;
import { createSuccessResponse } from '@/lib/api/common';

// Request schema
const setupRequestSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const POST = createApiHandler(
  setupRequestSchema,
  async (_req: NextRequest, authContext, data, services) => {
    try {
      const user = authContext.user!;
      const { method, phone, email } = data;

      const result = await services.twoFactor!.startSetup({
        userId: user.id,
        method,
        phone,
        email,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to start 2FA setup' },
          { status: 400 },
        );
      }

      return createSuccessResponse(result);
    } catch (error) {
      console.error('Error in 2FA setup:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
        { status: 500 },
      );
    }
  },
  { requireAuth: true, includeUser: true }
);
