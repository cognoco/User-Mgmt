import { NextRequest, NextResponse } from 'next/server';
import { getProfileVerificationStatus, requestProfileVerification } from '@/lib/profile/verificationService';
import { getUserFromRequest } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';

// Toggle document upload feature
const DOCUMENT_UPLOAD_ENABLED = true; // Set to false to disable document upload

// GET /api/profile/verify - fetch current user's profile verification status
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const status = await getProfileVerificationStatus(user.id);
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
    let documentUrl: string | undefined = undefined;
    if (DOCUMENT_UPLOAD_ENABLED && req.headers.get('content-type')?.includes('multipart/form-data')) {
      // Parse multipart form for file upload
      const formData = await req.formData();
      const file = formData.get('document') as File | null;
      if (file) {
        // Upload to Supabase Storage
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const filePath = `profile-verification/${user.id}/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('profile-verification').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (error) {
          return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
        }
        documentUrl = supabase.storage.from('profile-verification').getPublicUrl(filePath).publicUrl;
      }
    }
    const result = await requestProfileVerification(user.id, documentUrl);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to request verification' }, { status: 500 });
  }
}
