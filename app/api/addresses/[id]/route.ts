import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/services/address/factory';
import { addressSchema } from '@/core/address/validation';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiAddressService();
  const address = await service.getAddress(params.id, userId);
  return NextResponse.json({ address });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  const parse = addressSchema.partial().safeParse(data);
  if (!parse.success) return NextResponse.json({ error: parse.error.message }, { status: 400 });
  const service = getApiAddressService();
  const updated = await service.updateAddress(params.id, parse.data, userId);
  return NextResponse.json({ address: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiAddressService();
  await service.deleteAddress(params.id, userId);
  return NextResponse.json({}, { status: 204 });
}
