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

async function handleGet(req: NextRequest, id: string) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw createUnauthorizedError();
  const service = getApiAddressService();
  const address = await service.getAddress(id, userId);
  return createSuccessResponse({ address });
}

async function handlePut(req: NextRequest, id: string) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw createUnauthorizedError();
  const data = await req.json();
  const parse = addressSchema.partial().safeParse(data);
  if (!parse.success) throw createValidationError('Invalid address data', parse.error.flatten());
  const service = getApiAddressService();
  const updated = await service.updateAddress(id, parse.data, userId);
  return createSuccessResponse({ address: updated });
}

async function handleDelete(req: NextRequest, id: string) {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw createUnauthorizedError();
  const service = getApiAddressService();
  await service.deleteAddress(id, userId);
  return createNoContentResponse();
}

export const GET = (req: NextRequest, { params }: { params: { id: string } }) =>
  withRateLimit(req, r => withErrorHandling(q => handleGet(q, params.id), r));

export const PUT = (req: NextRequest, { params }: { params: { id: string } }) =>
  withRateLimit(req, r => withErrorHandling(q => handlePut(q, params.id), r));

export const DELETE = (
  req: NextRequest,
  { params }: { params: { id: string } }
) => withRateLimit(req, r => withErrorHandling(q => handleDelete(q, params.id), r));
