import { NextRequest, NextResponse } from 'next/server';
import { getApiSsoService } from '@/services/sso/factory';

// GET /api/organizations/[orgId]/sso/status
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;
  const service = getApiSsoService();
  const providers = await service.getProviders(orgId);
  if (!providers.length) {
    return NextResponse.json({
      status: 'unknown',
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    });
  }

  return NextResponse.json({
    status: 'healthy',
    lastSuccessfulLogin: null,
    lastError: null,
    totalSuccessfulLogins24h: 0,
  });
}

// PUT /api/organizations/[orgId]/sso/status
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;

  try {
    const body = await request.json();
    if (body && typeof body.providerId === 'string' && typeof body.active === 'boolean') {
      const service = getApiSsoService();
      await service.setProviderActive(body.providerId, body.active);
    }
    const service = getApiSsoService();
    const providers = await service.getProviders(orgId);
    const status = providers.length ? 'healthy' : 'unknown';
    return NextResponse.json({
      status,
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
