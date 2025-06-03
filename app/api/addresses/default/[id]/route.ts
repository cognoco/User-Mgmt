import { NextRequest, NextResponse } from 'next/server';
import { getApiPersonalAddressService } from '@/services/address/factory';
import { withRouteAuth } from '@/middleware/auth';
import { withSecurity } from '@/middleware/with-security';
import { createNoContentResponse } from '@/lib/api/common';

async function handlePost(_req: NextRequest, id: string, userId: string): Promise<NextResponse> {
  const service = getApiPersonalAddressService();
  await service.setDefaultAddress(id, userId);
  return createNoContentResponse();
}

export const POST = (req: NextRequest, { params }: { params: { id: string } }) =>
  withSecurity(r =>
    withRouteAuth((s, ctx) => handlePost(s, params.id, ctx.userId!), r)
  )(req);
