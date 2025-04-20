import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

// Zod schema for account deletion request
const DeleteAccountSchema = z.object({
  password: z.string().min(1, { message: 'Password confirmation is required.' }),
});

export async function DELETE(request: NextRequest) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase(); // Use service client for all ops
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error getting user for account deletion:', userError);
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }
    userId = user.id;
    userEmail = user.email;

    if (!userEmail) {
        return NextResponse.json({ error: 'User email not found, cannot verify password.' }, { status: 400 });
    }

    // 3. Parse and Validate Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = DeleteAccountSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    const { password } = parseResult.data;

    console.log('Account deletion attempt initiated for user:', userId);

    // 4. Verify user's current password
    const { error: signInError } = await supabaseService.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (signInError) {
      console.warn('Password verification failed during account deletion for user:', userId);
      return NextResponse.json({ error: 'Incorrect password provided.' }, { status: 401 });
    }

    console.log('Password verified for user:', userId, '. Proceeding with cleanup.');

    // --- Start Cleanup --- 
    // 5. Delete Profile Data
    console.log('Deleting profile data for user:', userId);
    const { error: profileError } = await supabaseService
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile data:', profileError);
      return NextResponse.json({ error: 'Failed to delete profile data.', details: profileError.message }, { status: 500 });
    }
    console.log('Profile data deleted for user:', userId);

    // 6. Delete Storage Files 
    console.log('Deleting storage files for user:', userId);
    const { data: listData, error: listError } = await supabaseService
        .storage
        .from('avatars') 
        .list(userId, { limit: 1 }); 
    
    if (listError) {
        console.error('Error listing storage objects during delete:', listError);
        // Log but continue
    } else if (listData && listData.length > 0) {
        // Attempt to remove user's folder
        // Supabase storage path structure might vary, adjust '`${userId}/`' if needed
        const filePathsToRemove = listData.map(file => `${userId}/${file.name}`);
        // If the list includes folders, you might need recursive deletion or just remove the top folder
        // Assuming direct file list or single top folder for simplicity here
        console.log('Removing storage paths:', filePathsToRemove);
        const { error: removeError } = await supabaseService
            .storage
            .from('avatars')
            .remove(filePathsToRemove); 
        
        if (removeError) {
            console.error('Error deleting storage objects:', removeError);
            // Critical failure, stop and report
            return NextResponse.json({ error: 'Failed to delete associated files.', details: removeError.message }, { status: 500 });
        }
        console.log('Storage files deleted for user:', userId);
    } else {
        console.log('No storage files found to delete for user:', userId);
    }

    // 7. Note: Not deleting auth.users record itself.

    console.log('Account cleanup successful for user:', userId);
    // --- End Cleanup --- 

    // 8. Return success
    // Client should handle redirecting or signing out locally
    return NextResponse.json({ message: 'Account data successfully cleaned up.' });

  } catch (error) {
    // 9. Handle Unexpected Errors
    console.error('Account deletion process error for user:', userId, error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Avoid sending specific details unless it was a known validation/auth error handled above
    return NextResponse.json({ error: 'Account deletion failed due to an unexpected error.', details: message }, { status: 500 });
  }
}

// TODO: Add GET handler if needed to fetch account info?
// export async function GET(request: NextRequest) { ... } 