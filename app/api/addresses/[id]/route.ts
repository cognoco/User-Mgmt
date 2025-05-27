import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

async function handleGet(_req: NextRequest, params: { id: string }, userId: string): Promise<NextResponse> {
  const service = getApiAddressService();
  const address = await service.getAddress(params.id, userId);
  return NextResponse.json({ address });
}

export const GET = withSecurity((req: NextRequest, ctx: { params: { id: string } }) =>
  withRouteAuth((r, uid) => handleGet(r, ctx.params, uid), req)
);

async function handlePut(req: NextRequest, params: { id: string }, userId: string): Promise<NextResponse> {
  const data = await req.json();
  const parse = addressSchema.partial().safeParse(data);
  if (!parse.success) return NextResponse.json({ error: parse.error.message }, { status: 400 });
  const service = getApiAddressService();
  const updated = await service.updateAddress(params.id, parse.data, userId);
  return NextResponse.json({ address: updated });
}

export const PUT = withSecurity((req: NextRequest, ctx: { params: { id: string } }) =>
  withRouteAuth((r, uid) => handlePut(r, ctx.params, uid), req)
);

async function handleDelete(_req: NextRequest, params: { id: string }, userId: string): Promise<NextResponse> {
  const service = getApiAddressService();
  await service.deleteAddress(params.id, userId);
  return NextResponse.json({}, { status: 204 });
}

export const DELETE = withSecurity((req: NextRequest, ctx: { params: { id: string } }) =>
  withRouteAuth((r, uid) => handleDelete(r, ctx.params, uid), req)
);
