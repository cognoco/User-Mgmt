import { NextRequest, NextResponse } from 'next/server';

// Mock data store - in production, this would be a database
const mockSSOStatus: Record<string, {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastSuccessfulLogin: string | null;
  lastError: string | null;
  totalSuccessfulLogins24h: number;
}> = {};

// GET /api/organizations/[orgId]/sso/status
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;
  
  // Initialize the status if it doesn't exist
  if (!mockSSOStatus[orgId]) {
    mockSSOStatus[orgId] = {
      status: 'unknown',
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    };
  }
  
  return NextResponse.json(mockSSOStatus[orgId]);
}

// PUT /api/organizations/[orgId]/sso/status
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;
  
  try {
    const body = await request.json();
    
    // Update the status
    mockSSOStatus[orgId] = {
      ...mockSSOStatus[orgId] || {
        status: 'unknown',
        lastSuccessfulLogin: null,
        lastError: null,
        totalSuccessfulLogins24h: 0,
      },
      ...body
    };
    
    return NextResponse.json(mockSSOStatus[orgId]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
} 