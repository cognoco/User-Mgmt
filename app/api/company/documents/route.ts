import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

// Document upload schema
const DocumentUploadSchema = z.object({
  type: z.enum(['registration', 'tax', 'other']),
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    base64: z.string()
  })
});

type DocumentUploadRequest = z.infer<typeof DocumentUploadSchema>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// --- POST Handler for uploading company documents ---
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

    // 4. Parse and Validate Body
    let body: DocumentUploadRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = DocumentUploadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }

    const { type, file } = parseResult.data;

    // 5. Validate File
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds limit' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 6. Upload File to Storage
    const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
    const filePath = `companies/${companyProfile.id}/documents/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseService.storage
      .from('company-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // 7. Create Document Record
    const { data: document, error: documentError } = await supabaseService
      .from('company_documents')
      .insert({
        company_id: companyProfile.id,
        type,
        filename: file.name,
        file_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (documentError) {
      // Cleanup uploaded file if record creation fails
      await supabaseService.storage
        .from('company-documents')
        .remove([filePath]);

      console.error('Document record creation error:', documentError);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    return NextResponse.json(document);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/documents:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

// --- GET Handler for fetching company documents ---
export async function GET(request: NextRequest) {
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

    // 4. Get Documents
    const { data: documents, error: documentsError } = await supabaseService
      .from('company_documents')
      .select('*')
      .eq('company_id', companyProfile.id)
      .order('created_at', { ascending: false });

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    // 5. Get Signed URLs for Documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data, error: signedUrlError } = await supabaseService.storage
          .from('company-documents')
          .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

        if (signedUrlError || !data) {
          console.error('Error getting signed URL:', signedUrlError);
          return {
            ...doc,
            signedUrl: null
          };
        }

        return {
          ...doc,
          signedUrl: data.signedUrl
        };
      })
    );

    return NextResponse.json(documentsWithUrls);

  } catch (error) {
    console.error('Unexpected error in GET /api/company/documents:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 