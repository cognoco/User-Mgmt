import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

async function handleGet(_req: NextRequest, userId: string) {
  const service = getApiAddressService();
  const addresses = await service.getAddresses(userId);
  return NextResponse.json({ addresses });
}

export const GET = withSecurity((req: NextRequest) =>
  withRouteAuth((r, uid) => handleGet(r, uid), req)
);

async function handlePost(req: NextRequest, userId: string) {
  const data = await req.json();
  const parse = addressSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.message }, { status: 400 });
  }
  const service = getApiAddressService();
  const address = await service.createAddress({ ...parse.data, userId });
  return NextResponse.json({ address }, { status: 201 });
}

export const POST = withSecurity((req: NextRequest) =>
  withRouteAuth((r, uid) => handlePost(r, uid), req)
);
