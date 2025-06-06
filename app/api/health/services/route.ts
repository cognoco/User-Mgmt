import { NextResponse } from 'next/server';
import { getHealthService } from '@/services/health';

export async function GET() {
  const healthService = getHealthService();
  const services = await healthService.checkAllServices();

  return NextResponse.json({
    database: services.database,
    redis: services.redis,
    email: services.email,
    storage: services.storage
  });
}
