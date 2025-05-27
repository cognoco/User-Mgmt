import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import {
  createSuccessResponse,
  createNoContentResponse,
  createValidationError,
  createUnauthorizedError,
} from '@/lib/api/common';
import { withRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

async function handleGet(_req: NextRequest, id: string, userId: string): Promise<NextResponse> {
  const service = getApiAddressService();
  const address = await service.getAddress(id, userId);
  return createSuccessResponse({ address });
}

async function handlePut(req: NextRequest, id: string, userId: string): Promise<NextResponse> {
  const data = await req.json();
  const parse = addressSchema.partial().safeParse(data);
  if (!parse.success) throw createValidationError('Invalid address data', parse.error.flatten());
  const service = getApiAddressService();
  const updated = await service.updateAddress(id, parse.data, userId);
  return createSuccessResponse({ address: updated });
}

async function handleDelete(_req: NextRequest, id: string, userId: string): Promise<NextResponse> {
  const service = getApiAddressService();
  await service.deleteAddress(id, userId);
  return createNoContentResponse();
}

// Use both rate limiting and security middleware with proper auth
export const GET = (req: NextRequest, { params }: { params: { id: string } }) =>
  withRateLimit(req, r => withSecurity(q => 
    withRouteAuth((s, uid) => handleGet(s, params.id, uid), q)
  )(r));

export const PUT = (req: NextRequest, { params }: { params: { id: string } }) =>
  withRateLimit(req, r => withSecurity(q => 
    withRouteAuth((s, uid) => handlePut(s, params.id, uid), q)
  )(r));

export const DELETE = (req: NextRequest, { params }: { params: { id: string } }) =>
  withRateLimit(req, r => withSecurity(q => 
    withRouteAuth((s, uid) => handleDelete(s, params.id, uid), q)
  )(r));
