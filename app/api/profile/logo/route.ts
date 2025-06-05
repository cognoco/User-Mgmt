import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { decode } from 'base64-arraybuffer'; // For decoding base64
import { getSessionFromToken } from '@/services/auth/factory';
import { getApiUserService } from '@/services/user/factory';

// Schema for logo upload request body
const LogoUploadSchema = z.object({
  logo: z.string(), // Expecting base64 string
  filename: z.string().optional(), // Optional filename for content type inference
});

type LogoUploadRequest = z.infer<typeof LogoUploadSchema>;


// --- POST Handler for uploading company logo --- 
export async function POST(request: NextRequest) {
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = await getSessionFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let body: LogoUploadRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parse = LogoUploadSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', details: parse.error.format() }, { status: 400 });
    }

    const base64Data = parse.data.logo.replace(/^data:.+;base64,/, '');
    const fileBuffer = decode(base64Data);

    const service = getApiUserService();
    const result = await service.uploadCompanyLogo(user.id, user.id, fileBuffer);
    if (!result.success || !result.url) {
      return NextResponse.json({ error: result.error || 'Failed to upload logo' }, { status: 500 });
    }

    return NextResponse.json({ companyLogoUrl: result.url });

  } catch (error) {
    console.error('Unexpected error in POST /api/profile/logo:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// --- DELETE Handler for removing company logo ---
export async function DELETE(request: NextRequest) {
    const isRateLimited = await checkRateLimit(request);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const user = await getSessionFromToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const service = getApiUserService();
      const result = await service.deleteCompanyLogo(user.id, user.id);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to remove logo' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Company logo removed successfully.' });

    } catch (error) {
      console.error('Unexpected error in DELETE /api/profile/logo:', error);
      return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
  }
