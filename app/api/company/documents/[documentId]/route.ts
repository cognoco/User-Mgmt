import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiCompanyService } from '@/services/company/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';

// --- DELETE Handler for removing company documents ---
async function handleDelete(
  request: NextRequest,
  params: { documentId: string },
  auth: RouteAuthContext
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // 4. Get Document
    const { data: document, error: documentError } = await supabaseService
      .from('company_documents')
      .select('*')
      .eq('id', params.documentId)
      .eq('company_id', companyProfile.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 5. Delete File from Storage
    const { error: storageError } = await supabaseService.storage
      .from('company-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    // 6. Delete Document Record
    const { error: deleteError } = await supabaseService
      .from('company_documents')
      .delete()
      .eq('id', params.documentId)
      .eq('company_id', companyProfile.id);

    if (deleteError) {
      console.error('Error deleting document record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/company/documents/[documentId]:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export const DELETE = (
  req: NextRequest,
  ctx: { params: { documentId: string } }
) => withRouteAuth((r, auth) => handleDelete(r, ctx.params, auth), req);
