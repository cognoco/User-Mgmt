import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import {
  createSuccessResponse,
  createCreatedResponse,
  createValidationError,
} from '@/lib/api/common';
import { withRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

async function handleGet(_req: NextRequest, userId: string) {
  const service = getApiAddressService();
  const addresses = await service.getAddresses(userId);
  return createSuccessResponse({ addresses });
}

async function handlePost(req: NextRequest, userId: string) {
  const data = await req.json();
  const parse = addressSchema.safeParse(data);
  if (!parse.success) throw createValidationError('Invalid address data', parse.error.flatten());
  const service = getApiAddressService();
  const address = await service.createAddress({ ...parse.data, userId });
  return createCreatedResponse({ address });
}

// Combined approach with both rate limiting and proper authentication
export const GET = (req: NextRequest) =>
  withRateLimit(req, r => withSecurity(q => 
    withRouteAuth((s, uid) => handleGet(s, uid), q)
  )(r));

export const POST = (req: NextRequest) =>
  withRateLimit(req, r => withSecurity(q => 
    withRouteAuth((s, uid) => handlePost(s, uid), q)
  )(r));