import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { decode } from 'base64-arraybuffer'; // For decoding base64
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

// Schema for avatar upload request body (supports both custom uploads and predefined avatars)
const AvatarUploadSchema = z.object({
  // For custom uploads: Base64 string of the image
  avatar: z.string().optional(),
  // For predefined avatars: ID or URL of the predefined avatar
  avatarId: z.string().optional(),
  filename: z.string().optional(), // Optional filename for content type inference
}).refine(data => data.avatar || data.avatarId, {
  message: "Either 'avatar' or 'avatarId' is required"
});

type AvatarUploadRequest = z.infer<typeof AvatarUploadSchema>;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const STORAGE_BUCKET = 'avatars'; // Define Supabase storage bucket name

// Predefined avatars - These would typically be stored in a database or config file
// For now, we're hardcoding them here
const PREDEFINED_AVATARS = [
  { id: 'avatar1', url: '/assets/avatars/avatar1.png', name: 'Default 1' },
  { id: 'avatar2', url: '/assets/avatars/avatar2.png', name: 'Default 2' },
  { id: 'avatar3', url: '/assets/avatars/avatar3.png', name: 'Default 3' },
  { id: 'avatar4', url: '/assets/avatars/avatar4.png', name: 'Default 4' },
  { id: 'avatar5', url: '/assets/avatars/avatar5.png', name: 'Default 5' },
  { id: 'avatar6', url: '/assets/avatars/avatar6.png', name: 'Default 6' },
];

// --- GET Handler to retrieve available predefined avatars ---
export async function GET(request: NextRequest) {
  // Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Return the list of predefined avatars
  return NextResponse.json({ 
    avatars: PREDEFINED_AVATARS 
  });
}

// --- POST Handler for uploading custom avatar or selecting predefined avatar --- 
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

    // 3. Parse and Validate Body
    let body: AvatarUploadRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = AvatarUploadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    
    let avatarUrl: string;
    
    // Handle predefined avatar selection
    if (parseResult.data.avatarId) {
      const selectedAvatar = PREDEFINED_AVATARS.find(avatar => avatar.id === parseResult.data.avatarId);
      if (!selectedAvatar) {
        return NextResponse.json({ error: 'Invalid predefined avatar ID' }, { status: 400 });
      }
      
      // Set the avatar URL to the predefined avatar URL
      avatarUrl = selectedAvatar.url;
    } 
    // Handle custom avatar upload
    else if (parseResult.data.avatar) {
      const base64Avatar = parseResult.data.avatar;
      
      // Extract mime type and decode base64
      const mimeMatch = base64Avatar.match(/^data:(.+);base64,/);
      if (!mimeMatch || mimeMatch.length < 2) {
        return NextResponse.json({ error: 'Invalid base64 image format.' }, { status: 400 });
      }
      const mimeType = mimeMatch[1];
      const base64Data = base64Avatar.replace(/^data:.+;base64,/, '');
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
        return NextResponse.json({ error: 'Failed to upload avatar.', details: uploadError.message }, { status: 500 });
      }

      // 7. Get Public URL
      const { data: urlData } = supabaseService.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        return NextResponse.json({ error: 'Failed to generate public URL for the avatar.' }, { status: 500 });
      }

      avatarUrl = urlData.publicUrl;
    } else {
      return NextResponse.json({ error: 'Either a custom avatar or predefined avatar ID is required.' }, { status: 400 });
    }

    // 8. Update User Profile with the new avatar URL
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({ avatarUrl: avatarUrl })
      .eq('userId', user.id);

    if (updateError) {
      console.error(`Profile update error for user ${user.id}:`, updateError);
      return NextResponse.json({ error: 'Failed to update profile with new avatar.', details: updateError.message }, { status: 500 });
    }

    // 9. Return Success Response
    return NextResponse.json({
      avatarUrl,
      message: 'Avatar updated successfully.'
    });

  } catch (error: any) {
    console.error('Unexpected error in avatar upload:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred while processing your request.',
      details: error.message
    }, { status: 500 });
  }
}

// --- DELETE Handler for removing avatar ---
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

    // 3. Update User Profile to remove avatar
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({ avatarUrl: null })
      .eq('userId', user.id);

    if (updateError) {
      console.error(`Profile update error for user ${user.id}:`, updateError);
      return NextResponse.json({ error: 'Failed to remove avatar from profile.', details: updateError.message }, { status: 500 });
    }

    // 4. Return Success Response
    return NextResponse.json({
      message: 'Avatar removed successfully.'
    });

  } catch (error: any) {
    console.error('Unexpected error in avatar removal:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred while processing your request.',
      details: error.message
    }, { status: 500 });
  }
} 