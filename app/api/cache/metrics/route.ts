import { NextResponse } from 'next/server';
import { permissionCacheService } from '@/services/permission/permission-cache.service';

export async function GET() {
  const metrics = permissionCacheService.getMetrics();
  return NextResponse.json({ data: metrics });
}
