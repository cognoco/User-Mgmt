import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/lib/api/address/factory';
import { addressSchema } from '@/core/address/validation';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiAddressService();
  const addresses = await service.getAddresses(userId);
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  const parse = addressSchema.safeParse(data);
  if (!parse.success) return NextResponse.json({ error: parse.error.message }, { status: 400 });
  const service = getApiAddressService();
  const address = await service.createAddress({ ...parse.data, userId });
  return NextResponse.json({ address }, { status: 201 });
}
