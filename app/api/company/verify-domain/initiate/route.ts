import { type NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken } from '@/services/auth/factory';
import { getApiCompanyService } from '@/services/company/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { URL } from 'url'; // Use Node.js URL parser

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const user = await getSessionFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const companyService = getApiCompanyService();
    const result = await companyService.initiateProfileDomainVerification(user.id);

    return NextResponse.json({
        domainName: result.domainName,
        verificationToken: result.verificationToken,
        message: "Verification initiated. Please add the provided token as a TXT record to your domain's DNS settings."
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/company/verify-domain/initiate:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 