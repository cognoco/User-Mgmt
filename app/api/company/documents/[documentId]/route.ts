import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';

// --- DELETE Handler for removing company documents ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    // 3. Get Company Profile
    const { data: companyProfile, error: companyError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyProfile) {
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