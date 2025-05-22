import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { decode } from 'base64-arraybuffer'; // For decoding base64
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

// Schema for logo upload request body
const LogoUploadSchema = z.object({
  logo: z.string(), // Expecting base64 string
  filename: z.string().optional(), // Optional filename for content type inference
});

type LogoUploadRequest = z.infer<typeof LogoUploadSchema>;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const STORAGE_BUCKET = 'company-logos'; // Define Supabase storage bucket name

// --- POST Handler for uploading company logo --- 
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

    // 3. Basic Permission Check (Corporate User)
    const { data: profileData, error: profileError } = await supabaseService
        .from('profiles')
        .select('userType')
        .eq('userId', user.id)
        .single();

    if (profileError || !profileData) {
        return NextResponse.json({ error: 'Profile not found or error checking type.' }, { status: 500 });
    }
    if (profileData.userType !== 'corporate') {
        return NextResponse.json({ error: 'Permission denied. Only corporate users can upload company logos.' }, { status: 403 });
    }

    // 4. Parse and Validate Body
    let body: LogoUploadRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = LogoUploadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    
    const { logo: base64Logo } = parseResult.data;

    // Extract mime type and decode base64
    const mimeMatch = base64Logo.match(/^data:(.+);base64,/);
    if (!mimeMatch || mimeMatch.length < 2) {
      return NextResponse.json({ error: 'Invalid base64 image format.' }, { status: 400 });
    }
    const mimeType = mimeMatch[1];
    const base64Data = base64Logo.replace(/^data:.+;base64,/, '');
    const fileBuffer = decode(base64Data);

    // 5. Validate File Type and Size
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }, { status: 400 });
    }
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
       return NextResponse.json({ error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` }, { status: 400 });
    }

    // 6. Upload to Supabase Storage
    const fileExtension = mimeType.split('/')[1]; // e.g., 'png'
    const uniqueFilename = `${user.id}-${uuidv4()}.${fileExtension}`;
    const filePath = `${user.id}/${uniqueFilename}`; // Store under user-specific folder

    const { error: uploadError } = await supabaseService.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if file exists (e.g., re-upload)
      });

    if (uploadError) {
      console.error(`Supabase storage upload error for user ${user.id}:`, uploadError);
      return NextResponse.json({ error: 'Failed to upload logo.', details: uploadError.message }, { status: 500 });
    }

    // 7. Get Public URL
    const { data: urlData } = supabaseService.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
        console.error(`Failed to get public URL for ${filePath}`);
        // Consider deleting the uploaded file if URL retrieval fails?
        return NextResponse.json({ error: 'File uploaded but failed to get URL.' }, { status: 500 });
    }
    const publicUrl = urlData.publicUrl;

    // 8. Update Profile Table
    const { error: updateProfileError } = await supabaseService
      .from('profiles')
      .update({ 
          companyLogoUrl: publicUrl,
          updatedAt: new Date().toISOString()
      })
      .eq('userId', user.id);

    if (updateProfileError) {
      console.error(`Failed to update profile with logo URL for user ${user.id}:`, updateProfileError);
      // Consider deleting the uploaded file if profile update fails?
      return NextResponse.json({ error: 'Logo uploaded but failed to update profile.', details: updateProfileError.message }, { status: 500 });
    }

    // 9. Handle Success
    console.log(`Company logo uploaded for user ${user.id}: ${publicUrl}`);
    return NextResponse.json({ companyLogoUrl: publicUrl });

  } catch (error) {
    console.error('Unexpected error in POST /api/profile/logo:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// --- DELETE Handler for removing company logo ---
export async function DELETE(request: NextRequest) {
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
  
      // 3. Fetch profile to get current logo URL and check permissions
      const { data: profileData, error: profileError } = await supabaseService
          .from('profiles')
          .select('userId, userType, companyLogoUrl') 
          .eq('userId', user.id)
          .single();
  
      if (profileError || !profileData) {
          return NextResponse.json({ error: 'Profile not found or error checking permissions.' }, { status: profileError?.code === 'PGRST116' ? 404 : 500 });
      }
      if (profileData.userType !== 'corporate') {
          return NextResponse.json({ error: 'Permission denied. Only corporate users can remove company logos.' }, { status: 403 });
      }
      
      const currentLogoUrl = profileData.companyLogoUrl;

      // 4. Update Profile Table (set companyLogoUrl to null)
      const { error: updateError } = await supabaseService
        .from('profiles')
        .update({ 
            companyLogoUrl: null, // Set to null
            updatedAt: new Date().toISOString()
        })
        .eq('userId', user.id);
  
      if (updateError) {
        console.error(`Supabase error clearing logo URL for user ${user.id}:`, updateError);
        return NextResponse.json({ error: 'Failed to remove logo reference from profile.', details: updateError.message }, { status: 500 });
      }
  
      // 5. Delete Logo from Storage (Optional but recommended)
      if (currentLogoUrl) {
          try {
              // Extract the file path from the URL
              // Assumes URL format: https://<project_ref>.supabase.co/storage/v1/object/public/company-logos/<user_id>/<filename>
              const urlParts = currentLogoUrl.split('/');
              const filePath = urlParts.slice(urlParts.indexOf(STORAGE_BUCKET) + 1).join('/');
              
              if (filePath) {
                 console.log(`Attempting to delete logo file from storage: ${filePath}`);
                 const { error: deleteError } = await supabaseService.storage
                    .from(STORAGE_BUCKET)
                    .remove([filePath]);
                 if (deleteError) {
                    console.error(`Failed to delete logo file ${filePath} from storage:`, deleteError);
                    // Log error but don't necessarily fail the request, as profile is updated
                 }
              }
          } catch (e) {
              console.error('Error parsing or deleting logo file from storage:', e);
          }
      }

      // 6. Handle Success
      console.log(`Company logo removed for user ${user.id}`);
      return NextResponse.json({ message: 'Company logo removed successfully.' });
  
    } catch (error) {
      console.error('Unexpected error in DELETE /api/profile/logo:', error);
      return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
  } 