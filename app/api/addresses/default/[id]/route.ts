import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';

async function handlePost(_req: NextRequest, params: { id: string }, userId: string) {
  const service = getApiAddressService();
  await service.setDefaultAddress(params.id, userId);
  return NextResponse.json({}, { status: 204 });
}

export const POST = withSecurity((req: NextRequest, ctx: { params: { id: string } }) =>
  withRouteAuth((r, auth) => handlePost(r, ctx.params, auth.userId!), req)
);
