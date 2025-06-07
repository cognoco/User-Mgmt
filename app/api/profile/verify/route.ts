import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { getApiProfileVerificationService } from '@/services/profileVerification/factory'114;

// Toggle document upload feature
const DOCUMENT_UPLOAD_ENABLED = true; // Set to false to disable document upload

// GET /api/profile/verify - fetch current user's profile verification status
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const service = getApiProfileVerificationService();
    const status = await service.getStatus(user.id);
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 });
  }
}

// POST /api/profile/verify - request profile verification (with optional document upload)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const service = getApiProfileVerificationService();
    let file: File | undefined;
    if (DOCUMENT_UPLOAD_ENABLED && req.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const uploaded = formData.get('document');
      if (uploaded instanceof File) {
        file = uploaded;
      }
    }
    const result = await service.requestVerification(user.id, file);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to request verification' }, { status: 500 });
  }
}
