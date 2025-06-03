import { NextRequest } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import {
  createSuccessResponse,
  createCreatedResponse,
  createValidationError,
} from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  rateLimitMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
} from '@/middleware/createMiddlewareChain';
import { withSecurity } from '@/middleware/with-security';

async function handleGet(_req: NextRequest, userId: string) {
  const service = getApiAddressService();
  const addresses = await service.getAddresses(userId);
  return createSuccessResponse({ addresses });
}

async function handlePost(_req: NextRequest, userId: string, data: any) {
  const parse = addressSchema.safeParse(data);
  if (!parse.success)
    throw createValidationError('Invalid address data', parse.error.flatten());
  const service = getApiAddressService();
  const address = await service.createAddress({ ...parse.data, userId });
  return createCreatedResponse({ address });
}

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const postMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(addressSchema),
]);

export const GET = withSecurity((req: NextRequest) =>
  baseMiddleware((r, auth) => handleGet(r, auth.userId!))(req)
);

export const POST = withSecurity((req: NextRequest) =>
  postMiddleware((r, auth, data) => handlePost(r, auth.userId!, data))(req)
);
