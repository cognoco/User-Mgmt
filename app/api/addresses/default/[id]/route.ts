import { NextRequest, NextResponse } from 'next/server';
import { getApiAddressService } from '@/lib/api/address/factory';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const service = getApiAddressService();
  await service.setDefaultAddress(params.id, userId);
  return NextResponse.json({}, { status: 204 });
}
