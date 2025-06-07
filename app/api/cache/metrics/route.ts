import { NextResponse } from 'next/server';
import { permissionCacheService } from '@/services/permission/permissionCache.service'45;

export async function GET() {
  const metrics = permissionCacheService.getMetrics();
  return NextResponse.json({ data: metrics });
}
