import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import {
  createSuccessResponse,
  createCreatedResponse,
  createValidationError,
  createUnauthorizedError,
} from '@/lib/api/common';
import { withRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';

async function handleGet(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw createUnauthorizedError();
  const service = getApiAddressService();
  const addresses = await service.getAddresses(userId);
  return createSuccessResponse({ addresses });
}

async function handlePost(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw createUnauthorizedError();
  const data = await req.json();
  const parse = addressSchema.safeParse(data);
  if (!parse.success) throw createValidationError('Invalid address data', parse.error.flatten());
  const service = getApiAddressService();
  const address = await service.createAddress({ ...parse.data, userId });
  return createCreatedResponse({ address });
}

export const GET = (req: NextRequest) =>
  withRateLimit(req, r => withErrorHandling(handleGet, r));

export const POST = (req: NextRequest) =>
  withRateLimit(req, r => withErrorHandling(handlePost, r));
